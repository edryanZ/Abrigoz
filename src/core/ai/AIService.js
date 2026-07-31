import { buildAIContext } from "./AIContextBuilder.js";
import { appendAIHistory } from "./AIHistoryRepository.js";
import { loadAIPreferences } from "./AIPreferencesService.js";
import { AIProviderAdapter } from "./AIProviderAdapter.js";

const LOCAL_GUIDES = {
  day: "Escolha uma prioridade pequena, uma pausa e algo que pode esperar.",
  goal: "Divida a meta em: primeiro passo, apoio necessário e sinal de conclusão.",
  diary: "O que merece ser lembrado deste momento, sem precisar explicar tudo?",
  routine: "Comece com uma ação simples, deixe espaço entre tarefas e encerre com calma.",
};

export class AIService {
  static controller = null;

  static localSuggestion(kind = "day") {
    return LOCAL_GUIDES[kind] ?? LOCAL_GUIDES.day;
  }

  static cancel() {
    this.controller?.abort();
    this.controller = null;
  }

  static async request(input, adapter = new AIProviderAdapter()) {
    const preferences = loadAIPreferences();
    if (!preferences.assistantEnabled || !preferences.allowSelectedContent) {
      throw new Error("Ative as autorizações necessárias antes de enviar.");
    }
    const context = buildAIContext({ ...input, autoRedact: preferences.autoRedact });
    if (!context.instruction || !input.confirmed) {
      throw new Error("Revise e confirme o conteúdo antes do envio.");
    }
    this.cancel();
    this.controller = new AbortController();
    try {
      const response = await adapter.send(context, this.controller.signal);
      appendAIHistory({ request: context.instruction, response }, preferences.saveHistory);
      return response;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("Resposta cancelada.", { cause: error });
      }
      throw new Error("O Assistente externo não está disponível agora.", { cause: error });
    } finally {
      this.controller = null;
    }
  }
}
