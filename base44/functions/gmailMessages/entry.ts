import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    if (action === 'list') {
      const maxResults = body.maxResults || 20;
      const query = body.query || '';
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const listRes = await fetch(url, { headers: authHeader });
      if (!listRes.ok) {
        const err = await listRes.json();
        return Response.json({ error: err.error?.message || 'Failed to list messages' }, { status: listRes.status });
      }
      const listData = await listRes.json();
      const messages = [];
      for (const m of (listData.messages || [])) {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          { headers: authHeader }
        );
        if (!msgRes.ok) continue;
        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
        const getHdr = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        messages.push({
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet || '',
          subject: getHdr('Subject') || '(no subject)',
          from: getHdr('From'),
          to: getHdr('To'),
          date: getHdr('Date'),
          unread: msg.labelIds?.includes('UNREAD') || false,
          starred: msg.labelIds?.includes('STARRED') || false,
        });
      }
      return Response.json({ messages, resultSizeEstimate: listData.resultSizeEstimate || 0 });
    }

    if (action === 'get') {
      const msgId = body.messageId;
      if (!msgId) return Response.json({ error: 'messageId required' }, { status: 400 });
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
        { headers: authHeader }
      );
      if (!msgRes.ok) {
        const err = await msgRes.json();
        return Response.json({ error: err.error?.message || 'Failed to get message' }, { status: msgRes.status });
      }
      const msg = await msgRes.json();
      const headers = msg.payload?.headers || [];
      const getHdr = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      // Extract body text
      let bodyText = '';
      let bodyHtml = '';
      const extractParts = (payload) => {
        if (!payload) return;
        if (payload.mimeType === 'text/plain' && payload.body?.data) {
          bodyText = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
        if (payload.mimeType === 'text/html' && payload.body?.data) {
          bodyHtml = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
        if (payload.parts) payload.parts.forEach(extractParts);
      };
      extractParts(msg.payload);

      // Extract attachments metadata
      const attachments = [];
      const collectAttachments = (payload) => {
        if (!payload) return;
        if (payload.filename && payload.body?.attachmentId) {
          attachments.push({ filename: payload.filename, partId: payload.partId, size: payload.body.size });
        }
        if (payload.parts) payload.parts.forEach(collectAttachments);
      };
      collectAttachments(msg.payload);

      return Response.json({
        id: msg.id,
        threadId: msg.threadId,
        subject: getHdr('Subject') || '(no subject)',
        from: getHdr('From'),
        to: getHdr('To'),
        cc: getHdr('Cc'),
        date: getHdr('Date'),
        bodyText,
        bodyHtml,
        snippet: msg.snippet || '',
        attachments,
        unread: msg.labelIds?.includes('UNREAD') || false,
        starred: msg.labelIds?.includes('STARRED') || false,
        labelIds: msg.labelIds || [],
      });
    }

    if (action === 'send') {
      const { to, subject, body, cc, bcc, attachments } = body;
      if (!to || !subject || !body) return Response.json({ error: 'to, subject, and body are required' }, { status: 400 });

      // Build RFC 2822 message — multipart/mixed if attachments, otherwise simple HTML
      const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
      const lines = [];
      lines.push(`To: ${to}`);
      if (cc) lines.push(`Cc: ${cc}`);
      if (bcc) lines.push(`Bcc: ${bcc}`);
      lines.push(`Subject: ${subject}`);

      if (hasAttachments) {
        const boundary = 'szjie_boundary_' + Math.random().toString(36).substring(2);
        lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        lines.push('MIME-Version: 1.0');
        lines.push('');
        // HTML body part
        lines.push('--' + boundary);
        lines.push('Content-Type: text/html; charset=UTF-8');
        lines.push('Content-Transfer-Encoding: 8bit');
        lines.push('');
        lines.push(body);
        lines.push('');
        // Attachment parts
        for (const att of attachments) {
          lines.push('--' + boundary);
          lines.push(`Content-Type: ${att.mimeType || 'application/octet-stream'}; name="${att.filename}"`);
          lines.push(`Content-Disposition: attachment; filename="${att.filename}"`);
          lines.push('Content-Transfer-Encoding: base64');
          lines.push('');
          // Wrap base64 at 76 chars per line (RFC 2045)
          const raw64 = att.content.replace(/\s/g, '');
          for (let i = 0; i < raw64.length; i += 76) {
            lines.push(raw64.substring(i, i + 76));
          }
          lines.push('');
        }
        lines.push('--' + boundary + '--');
      } else {
        lines.push('Content-Type: text/html; charset=UTF-8');
        lines.push('MIME-Version: 1.0');
        lines.push('');
        lines.push(body);
      }

      const rawMessage = lines.join('\r\n');

      // UTF-8 safe base64url encoding
      const messageBytes = new TextEncoder().encode(rawMessage);
      let binaryStr = '';
      for (let i = 0; i < messageBytes.length; i++) binaryStr += String.fromCharCode(messageBytes[i]);
      const encoded = btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ raw: encoded }),
      });
      if (!sendRes.ok) {
        const err = await sendRes.json();
        return Response.json({ error: err.error?.message || 'Failed to send email' }, { status: sendRes.status });
      }
      const result = await sendRes.json();
      return Response.json({ success: true, messageId: result.id, threadId: result.threadId });
    }

    if (action === 'markRead') {
      const msgId = body.messageId;
      if (!msgId) return Response.json({ error: 'messageId required' }, { status: 400 });
      const modRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}/modify`,
        { method: 'POST', headers: authHeader, body: JSON.stringify({ removeLabelIds: ['UNREAD'] }) }
      );
      if (!modRes.ok) {
        const err = await modRes.json();
        return Response.json({ error: err.error?.message || 'Failed to mark read' }, { status: modRes.status });
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});