// generate-city-plus.js — 특화 랜딩 자동 생성
// 입력: city-plus-template.html, city-plus-data.json, city-content.json
// 출력: public/{slug}-plus.html  (build.sh에서 호출)
//
// 각 도시마다 "슬러그-plus.html" 파일을 생성한다. 템플릿의 플레이스홀더를 데이터로 치환.
// seattle은 수제 seattle-plus.html이 있으므로 건너뛴다.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATE_PATH = path.join(ROOT, 'city-plus-template.html');
const PLUS_DATA_PATH = path.join(ROOT, 'city-plus-data.json');
const CONTENT_PATH = path.join(ROOT, 'city-content.json');
const OUT_DIR = path.join(ROOT, '..', 'public');

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const plusData = JSON.parse(fs.readFileSync(PLUS_DATA_PATH, 'utf-8'));
const content = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));

const SKIP = new Set(['_doc', '_schema']);

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderChecklist(items) {
  return items.map((it, i) => `
      <label class="check-item" data-idx="${i}">
        <input type="checkbox"/>
        <div class="body">
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.desc)}</p>
        </div>
      </label>`).join('\n');
}

function renderNeighborhoods(items) {
  return items.map(n => `
      <div class="nb-card">
        <div class="name">${escapeHtml(n.name)}</div>
        <div class="profile">${escapeHtml(n.profile)}</div>
      </div>`).join('\n');
}

function renderFaqs(allFaqs, picks) {
  return picks.map(i => {
    const f = allFaqs[i];
    if (!f) return '';
    return `
      <details class="faq">
        <summary>${escapeHtml(f.q)}</summary>
        <div class="answer">${escapeHtml(f.a)}</div>
      </details>`;
  }).join('\n');
}

function renderResources(items) {
  return items.map(r => `
      <a href="${escapeHtml(r.url)}" class="res-card" target="_blank" rel="noopener">
        <div class="label">${escapeHtml(r.label)}</div>
        <div class="desc">${escapeHtml(r.desc)}</div>
        <div class="arrow">열기 →</div>
      </a>`).join('\n');
}

function fillTemplate(slug, data, cityContent) {
  const faqHtml = renderFaqs(cityContent.faqs || [], data.faqPicks || []);
  const checklistHtml = renderChecklist(data.checklist || []);
  const neighborhoodsHtml = renderNeighborhoods(data.neighborhoods || []);
  const resourcesHtml = renderResources(data.officialResources || []);

  return template
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{NAME_KO\}\}/g, cityContent.nameKo || slug)
    .replace(/\{\{NAME_EN\}\}/g, cityContent.nameEn || slug)
    .replace(/\{\{COLOR\}\}/g, data.color || 'spectrum-01')
    .replace(/\{\{TAGLINE\}\}/g, escapeHtml(data.tagline || ''))
    .replace(/\{\{ORIGIN_NOTE\}\}/g, escapeHtml(data.originNote || ''))
    .replace(/\{\{CHECKLIST_HTML\}\}/g, checklistHtml)
    .replace(/\{\{NEIGHBORHOODS_HTML\}\}/g, neighborhoodsHtml)
    .replace(/\{\{FAQ_HTML\}\}/g, faqHtml)
    .replace(/\{\{RESOURCES_HTML\}\}/g, resourcesHtml);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

let generated = 0, skipped = 0;
for (const slug of Object.keys(plusData)) {
  if (SKIP.has(slug)) continue;
  if (slug === 'seattle') { skipped++; continue; }  // seattle-plus.html은 수제, 보호

  const cityContent = content[slug];
  if (!cityContent) {
    console.warn('  skip (no city-content):', slug);
    skipped++;
    continue;
  }

  const html = fillTemplate(slug, plusData[slug], cityContent);
  const outPath = path.join(OUT_DIR, `${slug}-plus.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log('  generated:', `${slug}-plus.html`, `(${html.length} bytes)`);
  generated++;
}

console.log(`\n✓ ${generated} city-plus landing(s) generated, ${skipped} skipped`);
