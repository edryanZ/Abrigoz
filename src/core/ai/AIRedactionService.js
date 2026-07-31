const PATTERNS = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[e-mail ocultado]"],
  [/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}\b/g, "[telefone ocultado]"],
  [/\bhttps?:\/\/[^\s]+/gi, "[URL ocultada]"],
  [/\b(?:rua|avenida|av\.|travessa|rodovia)\s+[^,\n]{3,80}(?:,\s*\d+)?/gi, "[endereço ocultado]"],
  [/\b[a-f0-9]{64}\b/g, "[identificador ocultado]"],
  [/\b(?:ABRIGO[-\s]?)?[A-Z0-9]{4}(?:[-\s][A-Z0-9]{4}){3,7}\b/g, "[chave ocultada]"],
];

export function redactPersonalInformation(value) {
  return PATTERNS.reduce((text, [pattern, replacement]) =>
    text.replace(pattern, replacement), String(value ?? ""));
}
