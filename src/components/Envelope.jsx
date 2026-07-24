import "./Envelope.css";

import { useState } from "react";
import { obterProgresso } from "../utils/progressoCartas";

export default function Envelope({
  categoria,
  onAbrir,
}) {
  const [abrindo, setAbrindo] = useState(false);

  const progresso = obterProgresso(categoria);

  function abrirEnvelope() {
    if (categoria.bloqueado || abrindo) return;

    setAbrindo(true);

    setTimeout(() => {
      onAbrir(categoria);
      setAbrindo(false);
    }, 700);
  }

  function teclado(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirEnvelope();
    }
  }

  const porcentagem =
    progresso.total > 0
      ? (progresso.lidas / progresso.total) * 100
      : 0;

  return (
    <article
      className={[
        "envelope",
        abrindo && "envelope--abrindo",
        categoria.bloqueado && "envelope--bloqueado",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={abrirEnvelope}
      onKeyDown={teclado}
      role="button"
      tabIndex={categoria.bloqueado ? -1 : 0}
      aria-label={`Abrir categoria ${categoria.nome}`}
    >
      <div className="envelope__label">
        <span>
          {categoria.emoji}
        </span>

        <h3>
          {categoria.titulo
            .split(" ")
            .slice(1)
            .join(" ")}
        </h3>
      </div>

      <div className="envelope__body">

        <div className="envelope__flap" />

        <div className="envelope__paper">

          <div className="envelope__emoji">
            {categoria.emoji}
          </div>

          <div className="envelope__progress">

            <div className="envelope__numbers">
              <span>
                {progresso.lidas}
              </span>

              <small>
                de {progresso.total}
              </small>
            </div>

            <div className="progress">

              <div
                className="progress__fill"
                style={{
                  width: `${porcentagem}%`,
                }}
              />

            </div>

          </div>

          {progresso.completo && (
            <div className="envelope__complete">
              ✨ Coleção concluída
            </div>
          )}

          {categoria.bloqueado && (
            <div className="envelope__locked">
              🔒 Em breve
            </div>
          )}

        </div>

      </div>

    </article>
  );
}