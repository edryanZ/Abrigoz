import "./Welcome.css";

import { FaMoon, FaSun, FaCloudSun } from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

import GlassCard from "../../components/GlassCard";

export default function Welcome() {
  const { greeting } = useTheme();
  const { user } = useUser();

  const currentHour = new Date().getHours();

  function getIcon() {
    if (currentHour >= 6 && currentHour < 12) {
      return <FaSun />;
    }

    if (currentHour >= 12 && currentHour < 18) {
      return <FaCloudSun />;
    }

    return <FaMoon />;
  }

  return (
    <GlassCard className="welcome-card">
      <div className="welcome-icon">
        {getIcon()}
      </div>

      <div className="welcome-content">
        <h2>
          {greeting}, {user?.name || "Visitante"}.
        </h2>

        <p>
          Seja bem-vindo ao Abrigo.
          Respire fundo, desacelere e aproveite este momento.
        </p>
      </div>
    </GlassCard>
  );
}