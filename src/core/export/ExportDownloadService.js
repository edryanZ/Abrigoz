export function safeFilename(value, extension) {
  const base = String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "abrigo-export";
  return `${base}.${extension}`;
}

export function downloadExport(content, filename, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  try {
    anchor.href = url; anchor.download = filename; anchor.rel = "noopener"; anchor.click();
  } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
}
