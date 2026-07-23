import "./Cartas.css";

import { useState } from "react";

import {
  Container,
  PageHeader,
  Section,
} from "../../components/layout";

import {
  CartaModal,
  Envelope,
} from "../../components/letters";

import { categorias } from "../../data/cartas";
import { sortearCarta } from "../../utils/sortearCarta";

export default function Cartas() {
  const [categoriaAtual, setCategoriaAtual] = useState(null);
  const [cartaAtual, setCartaAtual] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  function abrirEnvelope(categoria) {
    if (categoria.bloqueado) return;

    const carta = sortearCarta(categoria);

    if (!carta) return;

    setCategoriaAtual(categoria);
    setCartaAtual(carta);
    setModalAberto(true);
  }

  function fecharCarta() {
    setModalAberto(false);

    setTimeout(() => {
      setCategoriaAtual(null);
      setCartaAtual(null);
    }, 200);
  }

  return (
    <Container>
      <PageHeader
        greeting="💌 Cartas"
        title="Caixa de Cartas"
        subtitle="Cada envelope guarda uma mensagem diferente. Escolha um deles e descubra o que o Abrigo preparou para este momento."
      />

      <Section>
        <div className="cartas-grid">
          {categorias.map((categoria) => (
            <Envelope
              key={categoria.id}
              categoria={categoria}
              onAbrir={abrirEnvelope}
            />
          ))}
        </div>
      </Section>

      <CartaModal
        aberto={modalAberto}
        carta={cartaAtual}
        categoria={categoriaAtual}
        onClose={fecharCarta}
      />
    </Container>
  );
}