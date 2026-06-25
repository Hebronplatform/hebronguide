/* HebronGuide QR 코드 생성 — 스캔 시 바로 연결 */
const QR = require("qrcode");
const fs = require("fs");

const TARGETS = [
  { key: "main",   url: "https://hebronguide.com" },
  { key: "church", url: "https://hebronguide.com/church-guide" },
  { key: "ad",     url: "https://hebronguide.com/ad-request" }
];

const opts = {
  errorCorrectionLevel: "M",
  margin: 2,                       // quiet zone (스캔 안정성)
  width: 600,
  color: { dark: "#0A0E17", light: "#FFFFFF" }
};

(async () => {
  const out = {};
  for (const t of TARGETS) {
    const dataUrl = await QR.toDataURL(t.url, opts);
    out[t.key] = dataUrl;
    // PNG 파일도 저장 (검증/타용도)
    const b64 = dataUrl.split(",")[1];
    fs.writeFileSync(`qr-${t.key}.png`, Buffer.from(b64, "base64"));
  }
  // data URI 모음을 JSON으로 저장 (덱/PPTX 빌드에서 사용)
  fs.writeFileSync("_qr_data.json", JSON.stringify(out, null, 0));
  console.log("QR generated:", Object.keys(out).join(", "));
})();
