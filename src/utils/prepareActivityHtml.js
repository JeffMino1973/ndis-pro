// CSS for the "My Daily Schedule" static HTML app — injected inline because
// blob URLs can't resolve relative stylesheet references.
export const DAILY_SCHEDULE_CSS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Nunito', sans-serif;
  background: hsl(200 20% 97%);
  color: hsl(210 25% 15%);
  line-height: 1.5;
}
a { text-decoration: none; color: inherit; }

.navbar {
  position: sticky; top: 0; z-index: 50;
  background: #fff; border-bottom: 1px solid hsl(200 15% 87%);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.navbar-inner {
  max-width: 1100px; margin: 0 auto; padding: 10px 20px;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.navbar-brand { font-size: 18px; font-weight: 900; color: hsl(199 80% 46%); }
.navbar-links { display: flex; gap: 4px; flex-wrap: wrap; }
.navbar-links a {
  padding: 7px 12px; border-radius: 10px; font-size: 13px; font-weight: 700;
  color: hsl(210 10% 45%); transition: all 0.15s;
}
.navbar-links a:hover { background: hsl(200 15% 93%); color: hsl(210 25% 15%); }
.navbar-links a.active { background: hsl(199 80% 46%); color: #fff; }

.container { max-width: 1100px; margin: 0 auto; padding: 24px 20px 60px; }
.page-header {
  background: #fff; border: 1px solid hsl(200 15% 87%); border-radius: 16px;
  padding: 18px 22px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.page-header h1 { font-size: 22px; font-weight: 800; }
.page-header p { font-size: 13px; color: hsl(210 10% 45%); font-weight: 600; margin-top: 2px; }

.card {
  background: #fff; border: 1px solid hsl(200 15% 87%); border-radius: 16px;
  padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all 0.15s; }
.btn-primary { background: hsl(199 80% 46%); color: #fff; }
.btn-primary:hover { background: hsl(199 80% 40%); }
.btn-outline { background: #fff; border: 1px solid hsl(200 15% 87%); color: hsl(210 10% 45%); }

.grid { display: grid; gap: 16px; }
.grid-2 { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.grid-3 { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.grid-4 { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }

.act-card { background: #fff; border: 1px solid hsl(200 15% 87%); border-radius: 14px; padding: 12px; text-align: center; }
.act-card img, .act-thumb { width: 100%; aspect-ratio: 1; object-fit: contain; border-radius: 10px; background: hsl(200 15% 95%); border: 1px solid hsl(200 15% 90%); }
.act-card .name { font-size: 13px; font-weight: 700; margin-top: 8px; }
.img-placeholder { width: 100%; aspect-ratio: 1; border-radius: 10px; background: hsl(200 15% 95%); display: flex; align-items: center; justify-content: center; font-size: 28px; color: hsl(210 10% 70%); border: 1px solid hsl(200 15% 90%); }

.cat-header { display: flex; align-items: center; gap: 8px; margin: 24px 0 12px; }
.cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cat-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: hsl(210 10% 45%); }

.slot-row {
  display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px;
  border: 2px solid hsl(200 15% 87%); background: #fff; margin-bottom: 8px;
}
.slot-row.done { border-color: hsl(168 55% 48%); background: hsl(168 55% 95%); }
.slot-time { width: 64px; text-align: center; font-weight: 800; font-size: 15px; color: hsl(199 80% 46%); flex-shrink: 0; }
.slot-img { width: 56px; height: 56px; border-radius: 10px; border: 1px solid hsl(200 15% 90%); background: hsl(200 15% 95%); object-fit: contain; flex-shrink: 0; }
.slot-name { font-weight: 800; font-size: 16px; flex: 1; }
.slot-name.done { text-decoration: line-through; color: hsl(210 10% 55%); }

.checklist-item { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; border: 2px solid hsl(200 15% 87%); background: #fff; margin-bottom: 8px; }
.step-num { width: 36px; height: 36px; border-radius: 10px; background: hsl(210 25% 15%); color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.checklist-item img { width: 56px; height: 56px; border-radius: 10px; border: 1px solid hsl(200 15% 90%); object-fit: contain; flex-shrink: 0; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.badge-sky { background: hsl(199 80% 90%); color: hsl(199 80% 36%); }
.badge-amber { background: hsl(45 93% 88%); color: hsl(45 80% 32%); }

.empty { text-align: center; padding: 48px 20px; color: hsl(210 10% 55%); font-weight: 600; }

.footer { text-align: center; padding: 32px 20px; font-size: 12px; color: hsl(210 10% 55%); font-weight: 600; }

.vs-card { border-radius: 16px; padding: 18px; margin-bottom: 16px; border: 2px solid; }
.vs-img { width: 80px; height: 80px; border-radius: 12px; object-fit: contain; border: 1px solid hsl(200 15% 85%); background: #fff; }
.vs-choice { display: flex; gap: 12px; flex-wrap: wrap; }
.vs-choice-item { display: flex; flex-direction: column; align-items: center; gap: 6px; background: #fff; border: 1px solid hsl(200 15% 85%); border-radius: 12px; padding: 10px; }
.vs-label { font-size: 12px; font-weight: 700; color: hsl(210 10% 45%); text-transform: uppercase; letter-spacing: 0.03em; }

.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }
.stat-card { background: #fff; border: 2px solid hsl(199 80% 46%); border-radius: 14px; padding: 20px; text-align: center; }
.stat-num { font-size: 28px; font-weight: 900; color: hsl(199 80% 46%); }
.stat-label { font-size: 13px; font-weight: 700; margin-top: 4px; }`;

// The directory where the "My Daily Schedule" static files live on media.base44.com
const DAILY_SCHEDULE_BASE = "https://media.base44.com/files/public/69d54775d9a169daad84a133/";

/**
 * Prepare fetched HTML for blob-URL iframe rendering:
 * 1. Replace <link rel="stylesheet" href="styles.css"> with inline <style> (blob URLs can't resolve relative paths)
 * 2. Rewrite remaining relative href/src to absolute URLs based on the source file's directory
 */
export function prepareActivityHtml(html, sourceUrl) {
  const isDailySchedule = sourceUrl && sourceUrl.startsWith(DAILY_SCHEDULE_BASE);

  let out = html;

  if (isDailySchedule) {
    // Replace the external stylesheet link with inline styles
    out = out.replace(
      /<link[^>]*href=["']styles\.css["'][^>]*>/gi,
      `<style>${DAILY_SCHEDULE_CSS}</style>`
    );
  }

  // Determine base directory of the source URL
  try {
    const u = new URL(sourceUrl);
    const baseDir = u.href.substring(0, u.href.lastIndexOf("/") + 1);

    // Rewrite relative href and src attributes (skip ones that are already absolute/protocol-relative/hash)
    out = out.replace(
      /(href|src)=["']([^"'#]+)["']/gi,
      (match, attr, val) => {
        if (/^(https?:|\/\/|data:|blob:|#|mailto:|tel:)/i.test(val)) return match;
        if (isDailySchedule && val === "styles.css") return match; // already replaced
        // Resolve relative path against base directory
        const resolved = new URL(val, baseDir).href;
        return `${attr}="${resolved}"`;
      }
    );
  } catch {
    // sourceUrl not a valid URL — skip rewriting
  }

  return out;
}