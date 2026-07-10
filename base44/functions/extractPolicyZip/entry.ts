import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import JSZip from 'npm:jszip@3.10.1';

let cachedHtml = null;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (cachedHtml) return Response.json({ html: cachedHtml });

    const zipUrl = 'https://media.base44.com/files/public/69d54775d9a169daad84a133/94129367d__workspace_policy_output_interactive_policy_library_FIXED_WORKING.zip';
    const resp = await fetch(zipUrl);
    const arrayBuffer = await resp.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let html = await zip.file('index.html').async('string');

    const replacements = [
      ['North West Support Services', 'SZ-JIE Support Services'],
      ['North West', 'SZ-JIE'],
    ];

    for (const [from, to] of replacements) {
      html = html.split(from).join(to);
    }

    cachedHtml = html;
    return Response.json({ html: cachedHtml });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});