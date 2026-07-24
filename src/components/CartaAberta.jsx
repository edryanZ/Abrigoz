import "./CartaAberta.css";

import { useEffect } from "react";

export default function CartaAberta({
  aberta,
  carta,
  categoria,
  onClose,
}) {
  useEffect(() => {
    if (!aberta) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [aberta, onClose]);

  if (!aberta || !carta) {
    return null;
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <section
      className="carta-aberta"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-carta-aberta"
      onClick={handleOverlayClick}
    >
      <div className="folha">
        <button
          type="button"
          className="voltar"
          onClick={onClose}
          aria-label="Fechar carta"
        >
          ✕
        </button>

        {categoria && (
          <span className="categoria">
            {categoria.emoji} {categoria.nome}
          </span>
        )}

        <h1 id="titulo-carta-aberta">
          {carta.titulo}
        </h1>

        <article className="carta-texto">
          {carta.texto}
        </article>

        {carta.assinatura && (
          <footer>
            {carta.assinatura}
          </footer>
        )}
      </div>
    </section>
  );
}