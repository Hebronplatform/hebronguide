/* 덱의 'QR' 자리표시를 실제 QR 이미지로 교체 */
const fs = require("fs");
const qr = JSON.parse(fs.readFileSync("_qr_data.json", "utf8"));
const file = "presentation-hospitality.html";
let html = fs.readFileSync(file, "utf8");

function qrCard(dataUri, label){
  return `<div style="width:108px;height:108px;background:#fff;border-radius:10px;margin:0 auto;padding:7px;"><img src="${dataUri}" alt="${label} QR" style="width:100%;height:100%;display:block;image-rendering:pixelated;"/></div>`;
}

const mainPlaceholder  = `<div style="width:96px;height:96px;background:rgba(201,162,39,.08);border:2px solid rgba(201,162,39,.3);border-radius:8px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:.62rem;color:var(--muted2);">QR</div>`;
const churchPlaceholder = `<div style="width:96px;height:96px;background:rgba(110,231,183,.06);border:2px solid rgba(110,231,183,.25);border-radius:8px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:.62rem;color:var(--muted2);">QR</div>`;

let n = 0;
if (html.includes(mainPlaceholder))   { html = html.replace(mainPlaceholder,   qrCard(qr.main,   "hebronguide.com")); n++; }
if (html.includes(churchPlaceholder)) { html = html.replace(churchPlaceholder, qrCard(qr.church, "hebronguide.com/church-guide")); n++; }

fs.writeFileSync(file, html);
console.log("QR placeholders replaced:", n);
