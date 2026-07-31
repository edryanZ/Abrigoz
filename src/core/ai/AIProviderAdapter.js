export class AIProviderAdapter {
  constructor(endpoint = "/api/ai") {
    this.endpoint = endpoint;
  }

  async send(context, signal) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "abrigo-assistant", context }),
      signal,
    });
    if (!response.ok) throw new Error("Serviço externo indisponível.");
    const result = await response.json();
    if (typeof result?.text !== "string") throw new Error("Resposta externa inválida.");
    return result.text.slice(0, 12000);
  }
}
