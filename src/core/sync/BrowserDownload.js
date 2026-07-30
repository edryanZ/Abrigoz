export function createDatedFilename(prefix, extension, date = new Date()) {
  const datePart = date.toISOString().slice(0, 10);
  return `${prefix}-${datePart}.${extension}`;
}

export function downloadJsonFile(data, filename) {
  if (
    typeof document === "undefined" ||
    typeof Blob === "undefined" ||
    !globalThis.URL?.createObjectURL
  ) {
    throw new Error("Download indisponível neste dispositivo.");
  }

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json;charset=utf-8" }
  );
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  try {
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }

  return filename;
}
