import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const folderId = body.folder_id || null;
    const query = body.query || null;
    const pageToken = body.page_token || null;
    const sharedDriveId = body.shared_drive_id || null;

    const { accessToken: authToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // List shared drives
    if (sharedDriveId === '__list_drives__') {
      const drivesRes = await fetch('https://www.googleapis.com/drive/v3/drives?pageSize=50&fields=nextPageToken,drives(id,name)', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!drivesRes.ok) {
        const err = await drivesRes.json();
        return Response.json({ error: err.error?.message || 'Drive API error' }, { status: drivesRes.status });
      }
      const drivesData = await drivesRes.json();
      return Response.json({ drives: drivesData.drives || [], nextPageToken: drivesData.nextPageToken || null });
    }

    let q = query || '';
    if (folderId) {
      q = `'${folderId}' in parents and trashed = false`;
    } else if (!query) {
      q = 'trashed = false';
    }

    const params = new URLSearchParams({
      q,
      pageSize: '50',
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,size,iconLink,thumbnailLink,webViewLink,parents)',
      orderBy: 'modifiedTime desc',
    });
    if (pageToken) params.set('pageToken', pageToken);

    // Shared drive browsing
    if (sharedDriveId) {
      params.set('corpora', 'drive');
      params.set('driveId', sharedDriveId);
      params.set('includeItemsFromAllDrives', 'true');
      params.set('supportsAllDrives', 'true');
    }

    const apiUrl = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ error: err.error?.message || 'Drive API error' }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ files: data.files || [], nextPageToken: data.nextPageToken || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});