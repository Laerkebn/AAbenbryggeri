function safeFileName(input) {
  const raw = (input || "label").trim();
  return raw.replace(/[^\w\-]+/g, "_");
}

export function initLabelExport({
  nameInputId = "export-name",
  btnSvgId = "btn-export-svg",
  btnPngId = "btn-export-png",
  getSketch = () => window.__labelSketch,
} = {}) {
  const nameInput = document.getElementById(nameInputId);
  const btnSvg = document.getElementById(btnSvgId);
  const btnPng = document.getElementById(btnPngId);

  const filenameBase = () => safeFileName(nameInput?.value || "label");

  btnSvg?.addEventListener("click", () => {
    const s = getSketch();
    if (!s?.downloadSVG) return console.warn("downloadSVG findes ikke på sketchen endnu");
    s.downloadSVG(filenameBase());
  });

  btnPng?.addEventListener("click", () => {
    const s = getSketch();
    if (!s?.downloadPNG) return console.warn("downloadPNG findes ikke på sketchen endnu");
    s.downloadPNG(filenameBase());
  });
}