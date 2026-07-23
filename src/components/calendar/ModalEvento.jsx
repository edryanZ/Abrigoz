import "./ModalEvento.css";

import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

import InfoBlock from "./InfoBlock";

export default function ModalEvento({
  aberto,
  conteudo,
  onClose,
}) {
  useEffect(() => {
    if (!aberto) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [aberto, onClose]);

  if (!aberto || !conteudo) return null;

  const {
    dia,
    mes,
    evento,
    mensagens,
    musicas,
    cartasSecretas,
    surpresa,
  } = conteudo;

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-evento"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-calendario"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-fechar"
          onClick={onClose}
          aria-label="Fechar calendário"
        >
          <FaTimes />
        </button>

        <header className="modal-header">
          <div className="modal-icon">
            📅
          </div>

          <h2 id="titulo-modal-calendario">
            {dia} de {meses[mes - 1]}
          </h2>

          <p>
            Veja tudo o que o Abrigo preparou para esta data.
          </p>
        </header>

        {evento && (
          <InfoBlock
            icon={evento.emoji || "🎉"}
            title={evento.titulo}
          >
            <p>{evento.descricao}</p>
          </InfoBlock>
        )}

        {mensagens?.length > 0 && (
          <InfoBlock
            icon="❤️"
            title="Mensagem"
          >
            {mensagens.map((mensagem, index) => (
              <p key={index}>
                {mensagem.texto}
              </p>
            ))}
          </InfoBlock>
        )}

        {musicas?.length > 0 && (
          <InfoBlock
            icon="🎵"
            title="Música"
          >
            {musicas.map((musica, index) => (
              <div key={index}>
                <strong>
                  {musica.titulo}
                </strong>

                {musica.artista && (
                  <p>{musica.artista}</p>
                )}

                {musica.link && (
                  <a
                    href={musica.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvir música
                  </a>
                )}
              </div>
            ))}
          </InfoBlock>
        )}

        {cartasSecretas?.length > 0 && (
          <InfoBlock
            icon="💌"
            title="Carta"
          >
            {cartasSecretas.map((carta, index) => (
              <p key={index}>
                {carta.conteudo}
              </p>
            ))}
          </InfoBlock>
        )}

        {surpresa && (
          <InfoBlock
            icon="🎁"
            title="Surpresa"
          >
            <p>
              {typeof surpresa === "object"
                ? surpresa.descricao
                : surpresa}
            </p>
          </InfoBlock>
        )}
      </div>
    </div>
  );
}