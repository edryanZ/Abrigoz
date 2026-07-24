import "./Welcome.css";

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { FaMoon, FaSun, FaCloudSun } from "react-icons/fa";

import ROUTES from "../../constants/routes";

import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

import GlassCard from "../../components/GlassCard";

export default function Welcome() {
  const { greeting } = useTheme();

  const {
    user,
    createUser,
  } = useUser();

  const navigate = useNavigate();

  const [name, setName] = useState("");

  if (user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

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

  function handleContinue() {
    const trimmed = name.trim();

    if (!trimmed) return;

    createUser(trimmed);

    navigate(ROUTES.HOME, {
      replace: true,
    });
  }

  return (
    <GlassCard className="welcome-card">
      <div className="welcome-icon">
        {getIcon()}
      </div>

      <div className="welcome-content">
        <h2>{greeting}.</h2>

        <p>
          Bem-vindo ao Abrigo.
        </p>

        <p>
          Como você gostaria de ser chamado?
        </p>

        <input
          className="welcome-input"
          type="text"
          placeholder="Digite seu nome"
          value={name}
          maxLength={40}
          onChange={(e) =>
            setName(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleContinue();
            }
          }}
          autoFocus
        />

        <button
          className="welcome-button"
          onClick={handleContinue}
        >
          Continuar
        </button>
      </div>
    </GlassCard>
  );
}