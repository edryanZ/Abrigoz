import "./CartaModal.css";

import { useEffect, useReducer, useState } from "react";
import { saveWellbeingMoment } from "../../../core/memory/WellbeingMemoryService";
import { enterReadingFocus, leaveReadingFocus } from "../../../core/atmosphere/AtmosphereFocusService";

import GlassCard from "../../../shared/ui/GlassCard";
import GlassButton from "../../../shared/ui/GlassButton";

import {
  favorito,
  alternarFavorito,
} from "../../../core/utils/favoritos";
import { downloadShareCard } from "../../../core/sharing/ShareImageService";

export default function CartaModal({
  aberto,
  carta,
  categoria,
  onClose,
}) {
  const [, refresh] = useReducer((value) => value + 1, 0);
  const [presentation, setPresentation] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const favoritado = carta ? favorito(carta.id) : false;

  useEffect(() => {
    if (!aberto) return;
    enterReadingFocus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (presentation) setPresentation(false);
        else onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      leaveReadingFocus();
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [aberto, onClose, presentation]);

  if (!aberto || !carta) {
    return null;
  }

  function handleFavorito() {
    alternarFavorito(carta.id);

    refresh();
  }

  function handleSaveMoment() {
    saveWellbeingMoment({ title: carta.titulo, description: carta.texto, source: "letter" });
    refresh();
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
        className={`carta-modal ${presentation ? "carta-modal--presentation" : ""}`}
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

          <div className="carta-modal__actions">
          <GlassButton variant="secondary" onClick={() => setPresentation((value) => !value)}>
            {presentation ? "Sair da apresentação" : "Apresentar carta"}
          </GlassButton>
          {!presentation && <GlassButton variant="secondary" onClick={async () => {
            try {
              await downloadShareCard({ title: carta.titulo, text: carta.texto }, { skyInspired: true });
              setShareMessage("Cartão criado no seu dispositivo.");
            } catch { setShareMessage("Não foi possível criar o cartão agora."); }
          }}>Compartilhar como imagem</GlassButton>}
          {!presentation && <>
          <GlassButton variant="secondary" onClick={handleSaveMoment}>
            Guardar este momento
          </GlassButton>
          <GlassButton
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </GlassButton>
          </>}
          </div>
          {shareMessage && !presentation && <span role="status">{shareMessage}</span>}
        </footer>
      </GlassCard>
    </section>
  );
}
