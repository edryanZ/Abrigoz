import "./MoodSelector.css";

import { useState } from "react";
import { FaSmile, FaLaughBeam, FaMeh, FaFrown, FaTired, FaGrinStars } from "react-icons/fa";

import GlassCard from "../../../shared/ui/GlassCard";
import { useJourney } from "../../../shared/contexts/JourneyContext";
const moods = [
  {
    id: "very_happy",
    emoji: <FaGrinStars />,
    label: "Muito feliz",
  },
  {
    id: "happy",
    emoji: <FaLaughBeam />,
    label: "Feliz",
  },
  {
    id: "calm",
    emoji: <FaSmile />,
    label: "Tranquilo",
  },
  {
    id: "normal",
    emoji: <FaMeh />,
    label: "Normal",
  },
  {
    id: "sad",
    emoji: <FaFrown />,
    label: "Triste",
  },
  {
    id: "tired",
    emoji: <FaTired />,
    label: "Cansado",
  },
];

export default function MoodSelector() {
  const { saveMood } = useJourney();

  const [selectedMood, setSelectedMood] = useState(null);

  function handleMood(mood) {
    setSelectedMood(mood.id);

    saveMood(mood.id);
  }

  return (
    <GlassCard className="mood-card">
      <h3>Como você está se sentindo hoje?</h3>

      <div className="mood-grid">
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`mood-button ${
              selectedMood === mood.id ? "active" : ""
            }`}
            onClick={() => handleMood(mood)}
          >
            <span className="mood-icon">{mood.emoji}</span>

            <span>{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <p className="mood-success">
          Seu humor foi registrado 💚
        </p>
      )}
    </GlassCard>
  );
}