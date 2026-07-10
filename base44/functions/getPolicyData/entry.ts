import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const POLICY_URL = "https://media.base44.com/files/public/69d54775d9a169daad84a133/896d1b30e_SZ-JIE_Support_Services_Policies_and_Procedures.html";

// Global cache — fetched & parsed once, served instantly on all subsequent calls
let _cache = null;

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .trim();
}

// Extract h3/h4 headings from body HTML, inject stable IDs for anchor navigation
function processHeadings(html) {
  const headings = [];
  let counter = 0;

  const processed = html.replace(/<(h[34])>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, ''));
    if (!text) return match;

    const id = `sec-${counter}`;
    counter++;
    headings.push({ id, level: parseInt(tag[1]), text });
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });

  return { html: processed, headings };
}

async function fetchAndParse() {
  const res = await fetch(POLICY_URL);
  const html = await res.text();

  const parts = html.split('<article ');
  const policies = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const endIdx = part.indexOf('</article>');
    if (endIdx === -1) continue;

    const articleContent = part.substring(0, endIdx);
    const tagEnd = articleContent.indexOf('>');
    if (tagEnd === -1) continue;

    const openingTag = articleContent.substring(0, tagEnd);
    const innerHtml = articleContent.substring(tagEnd + 1);

    const idMatch = openingTag.match(/id="(policy-\d+)"/);
    if (!idMatch) continue;

    const catMatch = openingTag.match(/data-category="([^"]*)"/);
    const titleMatch = openingTag.match(/data-title="([^"]*)"/);
    const sourceMatch = openingTag.match(/data-source="([^"]*)"/);

    // Extract policy-body content
    const bodyMarker = '<div class="policy-body">';
    const bodyStart = innerHtml.indexOf(bodyMarker);
    let bodyHtml = '';
    if (bodyStart !== -1) {
      let rest = innerHtml.substring(bodyStart + bodyMarker.length);
      // Remove trailing copy-link button if present
      const copyLinkIdx = rest.indexOf('class="copy-link"');
      if (copyLinkIdx !== -1) {
        const buttonStart = rest.lastIndexOf('<button', copyLinkIdx);
        if (buttonStart !== -1) {
          rest = rest.substring(0, buttonStart);
        }
      }
      rest = rest.replace(/\s*<\/div>\s*$/i, '').trim();
      bodyHtml = rest;
    }

    const { html: bodyWithIds, headings } = processHeadings(bodyHtml);

    policies.push({
      id: idMatch[1],
      category: (catMatch?.[1] || 'Other').replace(/&amp;/g, '&'),
      title: (titleMatch?.[1] || 'Untitled').replace(/&amp;/g, '&'),
      source: (sourceMatch?.[1] || '').replace(/&amp;/g, '&'),
      bodyHtml: bodyWithIds,
      headings,
    });
  }

  return { policies, count: policies.length };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Serve from cache — no file download on subsequent calls
    if (!_cache) {
      _cache = await fetchAndParse();
    }
    return Response.json(_cache);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});