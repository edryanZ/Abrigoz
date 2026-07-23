import "./CartaModal.css";

import { useEffect, useState } from "react";

import GlassCard from "../layout/GlassCard";
import GlassButton from "../layout/GlassButton";

import {
    favorito,
    alternarFavorito,
} from "../../utils/favoritos";

export default function CartaModal({

    aberto,
    carta,
    categoria,
    onClose,

}) {

    const [favoritado, setFavoritado] = useState(false);

    useEffect(() => {

        if (!carta) return;

        setFavoritado(
            favorito(carta.id)
        );

    }, [carta]);

    useEffect(() => {

        function fechar(e) {

            if (e.key === "Escape") {

                onClose();

            }

        }

        if (aberto) {

            window.addEventListener(
                "keydown",
                fechar
            );

        }

        return () => {

            window.removeEventListener(
                "keydown",
                fechar
            );

        };

    }, [aberto, onClose]);

    if (!aberto || !carta) return null;

    function favoritar() {

        alternarFavorito(carta.id);

        setFavoritado(
            favorito(carta.id)
        );

    }

    return (

        <section
            className="modal-overlay"
            onClick={onClose}
        >

            <GlassCard
                className="carta-modal"
                hover={false}
                onClick={(e) => e.stopPropagation()}
            >

                <header className="carta-modal__header">

                    <div>

                        <span className="carta-modal__categoria">

                            {categoria.emoji}

                            {" "}

                            {categoria.nome}

                        </span>

                        <h2>

                            {carta.titulo}

                        </h2>

                    </div>

                    <button
                        className="favorito-btn"
                        onClick={favoritar}
                        aria-label="Favoritar carta"
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