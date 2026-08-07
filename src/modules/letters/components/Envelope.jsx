import "./Envelope.css";

import { useState } from "react";

export default function Envelope({
  categoria,
  onAbrir,
}) {
  const [abrindo, setAbrindo] = useState(false);

  function abrirEnvelope() {
    if (categoria.bloqueado || abrindo) return;

    setAbrindo(true);

    const reduceMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      onAbrir(categoria);
      setAbrindo(false);
    }, reduceMotion ? 0 : 700);
  }

  function teclado(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirEnvelope();
    }
  }

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

          <p className="envelope__invitation">Abra quando uma carta fizer sentido.</p>

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
