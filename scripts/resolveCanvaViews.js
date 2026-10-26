// Lee los links de Canva que hay en Notion y los convierte en enlaces de vista incrustables.
// Resultado: src/data/canvaViews.json  { "<id de la página de Notion>": "https://www.canva.com/design/ID/TOKEN/view" }
// Se ejecuta antes de cada build (ver .github/workflows/deploy.yml).
import fs from 'node:fs';

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '3fb92105-e196-812f-9af9-da2a1aed073f';
// Usa el secreto NOTION_TOKEN si existe; si no, el mismo token que ya usa la página (notionSyncService.js)
function readToken() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN;
  try {
    const src = fs.readFileSync(new URL('../src/services/notionSyncService.js', import.meta.url), 'utf8');
    const m = src.match(/const b64 = '([^']+)'/);
    return m ? Buffer.from(m[1], 'base64').toString('utf-8') : undefined;
  } catch {
    return undefined;
  }
}
const TOKEN = readToken();
const OUT = new URL('../src/data/canvaViews.json', import.meta.url);

const DESIGN_RE = /^https:\/\/(?:www\.)?canva\.com\/design\/([^/]+)\/([^/?#]+)/;
const SHORT_RE = /^https:\/\/(?:canva\.link\/|(?:www\.)?canva\.com\/d\/)/;

const viewFrom = (m) => `https://www.canva.com/design/${m[1]}/${m[2]}/view`;

async function resolveLink(link) {
  let url = link;
  for (let hop = 0; hop < 4; hop++) {
    const direct = url.match(DESIGN_RE);
    if (direct) return viewFrom(direct);
    if (!SHORT_RE.test(url)) return null;
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0' } });
    const next = res.headers.get('location');
    if (!next) return null;
    url = new URL(next, url).toString();
  }
  return null;
}

async function queryAll() {
  const pages = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    if (!res.ok) throw new Error(`Notion respondió ${res.status}`);
    const json = await res.json();
    pages.push(...json.results);
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function main() {
  if (!TOKEN) {
    console.log('Sin token de Notion: se conserva canvaViews.json como está.');
    return;
  }
  const views = {};
  for (const page of await queryAll()) {
    // La propiedad de vista tiene prioridad; si no, se usa el link editable
    const candidates = [
      page.properties?.['Vista (Canva / Link)']?.url,
      page.properties?.['Editable (Canva / Link)']?.url,
    ].filter(Boolean);
    for (const link of candidates) {
      try {
        const view = await resolveLink(link);
        if (view) {
          views[page.id] = view;
          break;
        }
      } catch (err) {
        console.warn(`No se pudo resolver ${link}: ${err.message}`);
      }
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(views, null, 2) + '\n');
  console.log(`Vistas de Canva resueltas: ${Object.keys(views).length}`);
}

main().catch((err) => {
  // Nunca debe romper el despliegue
  console.warn('resolveCanvaViews falló:', err.message);
});
