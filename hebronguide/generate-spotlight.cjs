// generate-spotlight.cjs — 파트너 스포트라이트 자동 생성
// 입력: spotlight-template.html, spotlight-data.json
// 출력: public/spotlight/{slug}.html
// build.sh 9-d 단계에서 호출.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATE_PATH = path.join(ROOT, 'spotlight-template.html');
const DATA_PATH = path.join(ROOT, 'spotlight-data.json');
const OUT_DIR = path.join(ROOT, '..', 'public', 'spotlight');

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

function escapeHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function renderParagraphs(ps){
  return (ps||[]).map(p => `    <p>${escapeHtml(p)}</p>`).join('\n');
}
function renderBridges(bs){
  return (bs||[]).map(b => `      <li>${escapeHtml(b)}</li>`).join('\n');
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let generated = 0;
for (const slug of Object.keys(data)) {
  if (slug.startsWith('_')) continue;
  const d = data[slug];
  const html = template
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{NAME\}\}/g, escapeHtml(d.name || slug))
    .replace(/\{\{NAME_EN\}\}/g, escapeHtml(d.nameEn || d.name || slug))
    .replace(/\{\{URL\}\}/g, escapeHtml(d.url || '#'))
    .replace(/\{\{COLOR\}\}/g, d.color || 'spectrum-01')
    .replace(/\{\{REGION\}\}/g, escapeHtml(d.region || ''))
    .replace(/\{\{SINCE\}\}/g, escapeHtml(d.since || ''))
    .replace(/\{\{ROLE\}\}/g, escapeHtml(d.role || ''))
    .replace(/\{\{TAGLINE\}\}/g, escapeHtml(d.tagline || ''))
    .replace(/\{\{PARAGRAPHS_HTML\}\}/g, renderParagraphs(d.paragraphs))
    .replace(/\{\{BRIDGES_HTML\}\}/g, renderBridges(d.readerBridges));

  const outPath = path.join(OUT_DIR, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log('  generated:', `spotlight/${slug}.html`, `(${html.length} bytes)`);
  generated++;
}

console.log(`\n✓ ${generated} spotlight page(s) generated`);
