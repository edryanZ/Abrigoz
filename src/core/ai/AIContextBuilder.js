import { redactPersonalInformation } from "./AIRedactionService.js";

const BLOCKED_FIELDS = /keyhash|cryptokey|abrigoid|ciphertext|syncqueue|credential|secret/i;

export function buildAIContext({ instruction, selections = [], autoRedact = true }) {
  const safeSelections = selections
    .filter((item) => item?.selected === true)
    .map(({ label, content }) => ({
      label: String(label ?? "Conteúdo").slice(0, 80),
      content: String(content ?? "").slice(0, 6000),
    }))
    .filter((item) => item.content && !BLOCKED_FIELDS.test(item.label));
  const context = {
    instruction: String(instruction ?? "").trim().slice(0, 1200),
    selections: safeSelections,
  };
  if (autoRedact) {
    context.instruction = redactPersonalInformation(context.instruction);
    context.selections = context.selections.map((item) => ({
      ...item, content: redactPersonalInformation(item.content),
    }));
  }
  return context;
}

export function contextPreview(context) {
  return [
    `Pedido: ${context.instruction || "(vazio)"}`,
    ...context.selections.map((item) => `${item.label}:\n${item.content}`),
  ].join("\n\n");
}
