import "./StreakCard.css";

import { FaFire, FaCalendarCheck } from "react-icons/fa";

import GlassCard from "../../components/GlassCard";
import { useJourney } from "../../context/JourneyContext";

export default function StreakCard() {
  const { streak, statistics, moods } = useJourney();

  return (
    <GlassCard className="streak-card">
      <div className="streak-header">
        <FaFire />
        <h3>Sua Jornada</h3>
      </div>

      <div className="streak-main">
        <span className="streak-number">
          {streak.currentStreak}
        </span>

        <span className="streak-label">
          dias consecutivos
        </span>
      </div>

      <div className="streak-stats">
        <div className="streak-item">
          <FaCalendarCheck />

          <div>
            <strong>{streak.uniqueVisits.length}</strong>
            <span>Dias registrados</span>
          </div>
        </div>

        <div className="streak-item">
          <strong>{statistics.lettersRead}</strong>
          <span>Cartas lidas</span>
        </div>

        <div className="streak-item">
          <strong>{moods.length}</strong>
          <span>Humores registrados</span>
        </div>
      </div>
    </GlassCard>
  );
}