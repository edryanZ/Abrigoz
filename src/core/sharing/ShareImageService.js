function paletteFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 6 || hour >= 19) return ["#0b1638", "#34235f"];
  if (hour < 9) return ["#745a84", "#d5917a"];
  if (hour < 17) return ["#547fa8", "#9ac3cf"];
  return ["#7b587e", "#d47d70"];
}

function wrapLines(context, text, maxWidth, maxLines = 12) {
  const words = String(text).trim().split(/\s+/).filter(Boolean); const lines = []; let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line); line = word; if (lines.length >= maxLines) break;
    } else line = candidate;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

export async function createShareCardBlob({ title = "Abrigo", text = "", skyInspired = true }, date = new Date()) {
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1080;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível criar a imagem neste navegador.");
  const colors = skyInspired ? paletteFor(date) : ["#26334a", "#3d4a5e"];
  const gradient = context.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, colors[0]); gradient.addColorStop(1, colors[1]);
  context.fillStyle = gradient; context.fillRect(0, 0, 1080, 1080);
  context.fillStyle = "rgba(255,255,255,.94)"; context.font = "600 44px system-ui, sans-serif";
  context.fillText(String(title).slice(0, 80), 100, 150); context.font = "400 54px Georgia, serif";
  const lines = wrapLines(context, text, 880); const startY = Math.max(300, 540 - lines.length * 38);
  lines.forEach((line, index) => context.fillText(line, 100, startY + index * 76));
  context.font = "500 30px system-ui, sans-serif"; context.fillStyle = "rgba(255,255,255,.72)";
  context.fillText("Abrigo", 100, 980);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob)
    : reject(new Error("Não foi possível gerar a imagem.")), "image/png"));
}

export async function downloadShareCard(selection, options = {}) {
  const blob = await createShareCardBlob({ ...selection, skyInspired: options.skyInspired !== false });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `abrigo-cartao-${new Date().toISOString().slice(0, 10)}.png`;
  anchor.click(); URL.revokeObjectURL(url); return true;
}
