import { amor } from "./cartas/amor";
import { carinho } from "./cartas/carinho";
import { motivacao } from "./cartas/motivacao";
import { diasDificeis } from "./cartas/diasDificeis";
import { sorria } from "./cartas/sorria";
import { abraco } from "./cartas/abraco";
import { gratidao } from "./cartas/gratidao";
import { esperanca } from "./cartas/esperanca";
import { reflexoes } from "./cartas/reflexoes";
import { bomDia } from "./cartas/bomDia";
import { boaNoite } from "./cartas/boaNoite";
import { natal } from "./cartas/natal";
import { anoNovo } from "./cartas/anoNovo";

export const categorias = [
  {
    id: "amor",
    titulo: "❤️ Amor",
    descricao: "Cartas sobre amor e sentimentos.",
    cartas: amor,
  },
  {
    id: "carinho",
    titulo: "🤍 Carinho",
    descricao: "Palavras acolhedoras para aquecer o coração.",
    cartas: carinho,
  },
  {
    id: "motivacao",
    titulo: "☀️ Motivação",
    descricao: "Um empurrãozinho para continuar.",
    cartas: motivacao,
  },
  {
    id: "dias-dificeis",
    titulo: "🌧️ Dias Difíceis",
    descricao: "Quando tudo parecer pesado, comece por aqui.",
    cartas: diasDificeis,
  },
  {
    id: "sorria",
    titulo: "😊 Sorria",
    descricao: "Mensagens para deixar o dia mais leve.",
    cartas: sorria,
  },
  {
    id: "abraco",
    titulo: "🤗 Abraço Virtual",
    descricao: "Um abraço em forma de palavras.",
    cartas: abraco,
  },
  {
    id: "gratidao",
    titulo: "🌹 Gratidão",
    descricao: "Lembretes das coisas boas da vida.",
    cartas: gratidao,
  },
  {
    id: "esperanca",
    titulo: "🌈 Esperança",
    descricao: "Para nunca deixar de acreditar.",
    cartas: esperanca,
  },
  {
    id: "reflexoes",
    titulo: "💭 Reflexões",
    descricao: "Pensamentos para desacelerar.",
    cartas: reflexoes,
  },
  {
    id: "bom-dia",
    titulo: "🌸 Bom Dia",
    descricao: "Comece o dia com uma boa mensagem.",
    cartas: bomDia,
  },
  {
    id: "boa-noite",
    titulo: "🌙 Boa Noite",
    descricao: "Mensagens para terminar o dia em paz.",
    cartas: boaNoite,
  },
  {
    id: "natal",
    titulo: "🎄 Natal",
    descricao: "Mensagens cheias de carinho para o Natal.",
    cartas: natal,
  },
  {
    id: "ano-novo",
    titulo: "🎆 Ano Novo",
    descricao: "Boas energias para um novo ciclo.",
    cartas: anoNovo,
  },
];