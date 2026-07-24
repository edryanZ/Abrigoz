import "./CartaModal.css";

import { useEffect, useState } from "react";

import GlassCard from "../../../shared/ui/GlassCard";
import GlassButton from "../../../shared/ui/GlassButton";

import {
  favorito,
  alternarFavorito,
} from "../../../core/utils/favoritos";

export default function CartaModal({
  aberto,
  carta,
  categoria,
  onClose,
}) {
  const [favoritado, setFavoritado] = useState(false);

  useEffect(() => {
    if (!carta) return;

    setFavoritado(favorito(carta.id));
  }, [carta]);

  useEffect(() => {
    if (!aberto) return;

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
  }, [aberto, onClose]);

  if (!aberto || !carta) {
    return null;
  }

  function handleFavorito() {
    alternarFavorito(carta.id);

    setFavoritado(
      favorito(carta.id)
    );
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <section
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-carta-modal"
    >
      <GlassCard
        className="carta-modal"
        hover={false}
      >
        <header className="carta-modal__header">
          <div>
            <span className="carta-modal__categoria">
              {categoria?.emoji} {categoria?.nome}
            </span>

            <h2 id="titulo-carta-modal">
              {carta.titulo}
            </h2>
          </div>

          <button
            type="button"
            className="favorito-btn"
            onClick={handleFavorito}
            aria-label={
              favoritado
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
            }
          >
            {favoritado ? "❤️" : "🤍"}
          </button>
        </header>

        <article className="carta-modal__texto">
          {carta.texto}
        </article>

        <footer className="carta-modal__footer">
          <span className="assinatura">
            {carta.assinatura}
          </span>

          <GlassButton
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </GlassButton>
        </footer>
      </GlassCard>
    </section>
  );
}