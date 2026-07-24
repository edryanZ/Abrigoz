import "./DailyLetter.css";

import { useMemo } from "react";
import { FaBookOpen } from "react-icons/fa";

import GlassCard from "../../components/GlassCard";

import { useJourney } from "../../context/JourneyContext";

const letters = [
  {
    id: 1,
    title: "Respire fundo",
    preview:
      "Nem todos os dias precisam ser incríveis. Alguns só precisam ser vividos com calma.",
  },
  {
    id: 2,
    title: "Continue caminhando",
    preview:
      "Cada pequeno passo constrói algo maior. Não subestime seu progresso.",
  },
  {
    id: 3,
    title: "Valorize os detalhes",
    preview:
      "As melhores lembranças normalmente nascem dos momentos mais simples.",
  },
  {
    id: 4,
    title: "Confie em você",
    preview:
      "Você já superou dias difíceis antes. Também conseguirá superar este.",
  },
  {
    id: 5,
    title: "Um novo começo",
    preview:
      "Todo amanhecer oferece uma nova oportunidade para recomeçar.",
  },
];

export default function DailyLetter() {
  const { incrementLetters } = useJourney();

  const todayLetter = useMemo(() => {
    const day = new Date().getDate();
    return letters[day % letters.length];
  }, []);

  function handleRead() {
    incrementLetters();

    alert(
      `${todayLetter.title}\n\n${todayLetter.preview}\n\n(Esta será substituída pela página completa de cartas futuramente.)`
    );
  }

  return (
    <GlassCard className="daily-letter-card">
      <div className="daily-letter-header">
        <FaBookOpen />

        <h3>Carta do Dia</h3>
      </div>

      <h4>{todayLetter.title}</h4>

      <p>{todayLetter.preview}</p>

      <button
        className="daily-letter-button"
        onClick={handleRead}
      >
        Ler carta
      </button>
    </GlassCard>
  );
}