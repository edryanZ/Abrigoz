import { bomDia } from "./cartas/bomDia";
import { boaNoite } from "./cartas/boaNoite";
import { motivacao } from "./cartas/motivacao";
import { inspiracao } from "./cartas/inspiracao";
import { reflexoes } from "./cartas/reflexoes";
import { sorria } from "./cartas/sorria";
import { gratidao } from "./cartas/gratidao";
import { diasDificeis } from "./cartas/diasDificeis";
import { natureza } from "./cartas/natureza";
import { objetivos } from "./cartas/objetivos";

export const categorias = [
  {
    id: "bom-dia",
    titulo: "☀️ Bom Dia",
    descricao: "Comece o dia com uma mensagem positiva.",
    cartas: bomDia,
  },
  {
    id: "boa-noite",
    titulo: "🌙 Boa Noite",
    descricao: "Encerre o dia com tranquilidade e boas palavras.",
    cartas: boaNoite,
  },
  {
    id: "motivacao",
    titulo: "🚀 Motivação",
    descricao: "Mensagens para continuar seguindo em frente.",
    cartas: motivacao,
  },
  {
    id: "inspiracao",
    titulo: "💡 Inspiração",
    descricao: "Ideias e pensamentos para inspirar o seu dia.",
    cartas: inspiracao,
  },
  {
    id: "reflexoes",
    titulo: "🌱 Reflexões",
    descricao: "Momentos para pensar com calma sobre a vida.",
    cartas: reflexoes,
  },
  {
    id: "gratidao",
    titulo: "🙏 Gratidão",
    descricao: "Lembretes das pequenas coisas que fazem diferença.",
    cartas: gratidao,
  },
  {
    id: "sorria",
    titulo: "😊 Sorria",
    descricao: "Mensagens leves para arrancar um sorriso.",
    cartas: sorria,
  },
  {
    id: "dias-dificeis",
    titulo: "❤️‍🩹 Dias Difíceis",
    descricao: "Palavras para quando os dias parecerem mais pesados.",
    cartas: diasDificeis,
  },
  {
    id: "natureza",
    titulo: "🌿 Natureza",
    descricao: "Inspire-se na beleza e na tranquilidade da natureza.",
    cartas: natureza,
  },
  {
    id: "objetivos",
    titulo: "🎯 Objetivos",
    descricao: "Mensagens para manter o foco nos seus sonhos.",
    cartas: objetivos,
  },
];