import "./Sobre.css";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";

import Container from "../../shared/ui/Container";
import Section from "../../shared/ui/Section";
import GlassCard from "../../shared/ui/GlassCard";

const recursos = [
  {
    icon: "🏡",
    titulo: "Lar",
    descricao:
      "A página principal do Abrigo, criada para transmitir conforto e reunir tudo o que é mais importante.",
  },
  {
    icon: "📅",
    titulo: "Calendário",
    descricao:
      "Datas importantes ficam organizadas para que momentos especiais nunca sejam esquecidos.",
  },
  {
    icon: "💌",
    titulo: "Cartas",
    descricao:
      "Um espaço para escrever, guardar e revisitar mensagens sempre que desejar.",
  },
  {
    icon: "🎵",
    titulo: "Música",
    descricao:
      "Trilhas sonoras ajudam cada lembrança a se tornar ainda mais especial.",
  },
];

const informacoes = [
  {
    titulo: "Projeto",
    valor: "Abrigo",
  },
  {
    titulo: "Versão",
    valor: "2.0",
  },
  {
    titulo: "Tecnologias",
    valor: "React • Vite • PWA",
  },
];

export default function Sobre() {
  return (
    <>
      <Ceu />

      <Navbar />

      <Container>
        <PageHeader
          greeting="🌙 Sobre"
          title="Conheça o Abrigo"
          subtitle="Um espaço criado para guardar memórias, registrar momentos importantes e transformar lembranças em algo que sempre estará ao seu alcance."
        />

        <Section>
          <GlassCard>
            <h2>O que é o Abrigo?</h2>

            <p>
              O Abrigo é um aplicativo pensado para preservar momentos importantes
              de uma forma simples, organizada e acolhedora. Mais do que armazenar
              informações, ele busca dar significado às lembranças, permitindo que
              cada registro continue vivo com o passar do tempo.
            </p>

            <p>
              Cada detalhe foi desenvolvido para criar um ambiente tranquilo,
              onde seja possível revisitar histórias, celebrar datas especiais
              e manter memórias sempre por perto.
            </p>
          </GlassCard>
        </Section>

        <Section title="O que você encontra aqui">
          <div className="sobre-grid">
            {recursos.map((item) => (
              <GlassCard key={item.titulo} className="sobre-item">
                <span>{item.icon}</span>

                <h3>{item.titulo}</h3>

                <p>{item.descricao}</p>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Section>
          <GlassCard>
            <h2>Nossa proposta</h2>

            <p>
              O Abrigo foi criado acreditando que pequenas lembranças podem ter
              um grande significado. Registrar acontecimentos, guardar mensagens
              e organizar momentos importantes é uma forma de manter vivas partes
              da nossa história.
            </p>

            <p>
              Em vez de ser apenas um aplicativo, o Abrigo procura oferecer um
              espaço acolhedor, bonito e agradável para revisitar aquilo que faz
              sentido para cada pessoa.
            </p>
          </GlassCard>
        </Section>

        <Section title="Desenvolvimento">
          <div className="sobre-info">
            {informacoes.map((item) => (
              <GlassCard key={item.titulo}>
                <strong>{item.titulo}</strong>

                <p>{item.valor}</p>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Section>
          <GlassCard className="sobre-final">
            <p className="citacao">
              "Algumas lembranças merecem um lugar especial para continuar
              existindo."
            </p>
          </GlassCard>
        </Section>

        <footer className="page-footer">
          <p>✨ Abrigo 2.0 • Um lugar para guardar o que realmente importa.</p>
        </footer>
      </Container>
    </>
  );
}