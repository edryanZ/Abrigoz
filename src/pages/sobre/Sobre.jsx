import "./Sobre.css";

import {
  Container,
  PageHeader,
  Section,
  GlassCard,
} from "../../components/layout";

export default function Sobre() {
  return (
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

      <Section>

        <GlassCard>

          <h2>O que você encontra aqui</h2>

          <div className="sobre-grid">

            <div className="sobre-item">
              <span>🏡</span>

              <h3>Lar</h3>

              <p>
                A página principal do Abrigo, criada para transmitir conforto
                e reunir tudo o que é mais importante.
              </p>
            </div>

            <div className="sobre-item">
              <span>📅</span>

              <h3>Calendário</h3>

              <p>
                Datas importantes ficam organizadas para que momentos especiais
                nunca sejam esquecidos.
              </p>
            </div>

            <div className="sobre-item">
              <span>💌</span>

              <h3>Cartas</h3>

              <p>
                Um espaço para escrever, guardar e revisitar mensagens sempre
                que desejar.
              </p>
            </div>

            <div className="sobre-item">
              <span>🎵</span>

              <h3>Música</h3>

              <p>
                Trilhas sonoras ajudam cada lembrança a se tornar ainda mais
                especial.
              </p>
            </div>

          </div>

        </GlassCard>

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

      <Section>

        <GlassCard>

          <h2>Desenvolvimento</h2>

          <div className="sobre-info">

            <div>
              <strong>Projeto</strong>
              <p>Abrigo</p>
            </div>

            <div>
              <strong>Versão</strong>
              <p>2.0</p>
            </div>

            <div>
              <strong>Tecnologias</strong>
              <p>React • Vite • PWA</p>
            </div>

          </div>

        </GlassCard>

      </Section>

      <Section>

        <GlassCard className="sobre-final">

          <p className="citacao">
            "Algumas lembranças merecem um lugar especial para continuar
            existindo."
          </p>

        </GlassCard>

      </Section>

    </Container>
  );
}