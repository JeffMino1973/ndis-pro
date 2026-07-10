import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import JSZip from 'npm:jszip@3.10.1';

let cachedUrl = null;
let cachedHtml = null;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Return cached upload URL if already processed
    if (cachedUrl) return Response.json({ url: cachedUrl });

    // Download the ZIP
    const zipUrl = 'https://media.base44.com/files/public/69d54775d9a169daad84a133/94129367d__workspace_policy_output_interactive_policy_library_FIXED_WORKING.zip';
    const resp = await fetch(zipUrl);
    const arrayBuffer = await resp.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let html = await zip.file('index.html').async('string');

    // Rebrand: replace all North West Support Services references
    const replacements = [
      ['North West Support Services', 'SZ-JIE Support Services'],
      ['North West', 'SZ-JIE'],
    ];

    let replaceCount = 0;
    for (const [from, to] of replacements) {
      const matches = html.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
      if (matches) replaceCount += matches.length;
      html = html.split(from).join(to);
    }

    cachedHtml = html;

    // Upload the rebranded HTML as a static file
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'szjie-policy-library.html', { type: 'text/html' });
    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    cachedUrl = uploadRes.file_url;

    return Response.json({ url: cachedUrl, replacements: replaceCount, htmlSize: html.length });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});