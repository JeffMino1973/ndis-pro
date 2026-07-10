import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import JSZip from 'npm:jszip@3.10.1';

let cachedHtml = null;

const IFRAME_CSS_FIX = `<style id="iframe-render-fix">
html, body { width: 100% !important; height: auto !important; max-width: 100% !important; overflow-y: auto !important; overflow-x: hidden !important; margin: 0 !important; padding: 0 !important; }
.page-container { width: 100% !important; max-width: 100% !important; height: auto !important; min-height: 100% !important; overflow: visible !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
.content-shell { width: 100% !important; max-width: 100% !important; height: auto !important; overflow: visible !important; display: flex !important; flex-direction: column !important; }
.main-flow { width: 100% !important; max-width: 100% !important; overflow: visible !important; flex: 1 1 auto !important; padding: 12px !important; box-sizing: border-box !important; }
.toolbar { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; flex-wrap: wrap !important; }
.meta-grid { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
.policy-card { display: block !important; visibility: visible !important; opacity: 1 !important; }
#policyList { display: block !important; visibility: visible !important; }
#emptyState { display: none !important; }
aside, .sidebar, .side-nav, .cat-nav { width: 100% !important; max-width: 100% !important; position: relative !important; }
.manual-brand-header, .hero, .package-tabs { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; overflow: visible !important; }
</style>`;

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

    // Rebrand
    html = html.split('North West Support Services').join('SZ-JIE Support Services');
    html = html.split('North West').join('SZ-JIE');

    // Inject CSS overrides — robust: try </head> first, then <body>, then prepend
    if (html.includes('</head>')) {
      html = html.replace('</head>', IFRAME_CSS_FIX + '</head>');
    } else if (/<body[^>]*>/.test(html)) {
      html = html.replace(/<body[^>]*>/, (match) => match + IFRAME_CSS_FIX);
    } else {
      html = IFRAME_CSS_FIX + html;
    }

    cachedHtml = html;
    return Response.json({ html: cachedHtml });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});