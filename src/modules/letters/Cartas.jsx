import "./Cartas.css";

import { useState } from "react";

import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";

import Container from "../../shared/ui/Container";
import Section from "../../shared/ui/Section";

import CartaModal from "../home/components/CartaModal";

import Envelope from "./components/Envelope";

import { categorias } from "../../data/cartas";

import { sortearCarta } from "../../core/utils/sortearCarta";

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
    <>
      <Navbar />

      <Container>
        <PageHeader
          greeting="💌 Cartas"
          title="Cartas"
          subtitle="Escolha um envelope quando quiser encontrar uma mensagem para fazer companhia ao seu momento."
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
    </>
  );
}
