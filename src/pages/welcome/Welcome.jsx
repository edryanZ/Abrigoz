import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

import "./Welcome.css";

export default function Welcome() {
  const [name, setName] = useState("");

  const { createUser } = useUser();

  const navigate = useNavigate();

  function handleContinue() {
    if (!name.trim()) return;

    createUser(name);

    navigate("/");
  }

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <h1>Abrigo</h1>

        <p>
          Um lugar para guardar aquilo que realmente importa.
        </p>

        <input
          type="text"
          placeholder="Como você gostaria de ser chamado?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
        />

        <button onClick={handleContinue}>
          Continuar
        </button>
      </div>
    </div>
  );
}