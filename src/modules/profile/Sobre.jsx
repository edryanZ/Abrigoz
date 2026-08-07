import "./Sobre.css";

import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";

import Container from "../../shared/ui/Container";
import Section from "../../shared/ui/Section";
import GlassCard from "../../shared/ui/GlassCard";
import { APP } from "../../core/constants/app";

const recursos = [
  {
    icon: "🏡",
    titulo: "Lar",
    descricao:
      "A página principal do Abrigo, criada para transmitir conforto e reunir tudo o que é mais importante.",
  },
  {
    icon: "🌿",
    titulo: "Momento do Dia",
    descricao:
      "Uma mensagem local e tranquila para acompanhar o dia sem pedir nada em troca.",
  },
  {
    icon: "📖",
    titulo: "Reflexões",
    descricao:
      "Perguntas opcionais para guardar respostas quando existir vontade de escrever.",
  },
  {
    icon: "💌",
    titulo: "Cartas",
    descricao:
      "Um espaço para escrever, guardar e revisitar mensagens sempre que desejar.",
  },
  {
    icon: "💚",
    titulo: "Pequenos Cuidados",
    descricao:
      "Sugestões simples de cuidado, sem sequência, cobrança ou desempenho.",
  },
];

const informacoes = [
  {
    titulo: "Projeto",
    valor: "Abrigo",
  },
  {
    titulo: "Versão",
    valor: APP.VERSION,
  },
  {
    titulo: "Tecnologias",
    valor: "React • Vite • PWA",
  },
];

export default function Sobre() {
  return (
    <>
      <Navbar />

      <Container>
        <PageHeader
          greeting="🌙 Sobre"
          title="Conheça o Abrigo"
          subtitle="Um espaço digital de acolhimento, reflexão e motivação leve."
        />

        <Section>
          <GlassCard>
            <h2>O que é o Abrigo?</h2>

            <p>
              O Abrigo é um espaço pessoal para desacelerar, refletir e guardar
              aquilo que faz sentido para você. Tudo pode ser usado no seu ritmo,
              sem transformar cuidado em tarefa ou resultado.
            </p>

            <p>
              Cada detalhe foi desenvolvido para criar um ambiente tranquilo,
              onde seja possível revisitar histórias, encontrar pequenas pausas
              e manter lembranças por perto.
            </p>
          </GlassCard>
        </Section>

        <Section title="Um lugar para voltar">
          <GlassCard>
            <h2>Desacelerar também cabe aqui</h2>
            <p>
              O céu, a música opcional, as cartas e a Janela do Abrigo existem
              para criar atmosfera sem tirar o foco daquilo que você veio ler,
              guardar ou simplesmente sentir. Você escolhe quanto quer usar.
            </p>
            <p>
              Suas memórias e preferências funcionam localmente. Quando você
              decide sincronizar, o Abrigo mantém as proteções existentes e
              continua tratando a Chave do Abrigo como algo que pertence a você.
            </p>
          </GlassCard>
        </Section>

        <Section title="Quem criou o Abrigo">
          <GlassCard className="sobre-criador">
            <div>
              <span className="sobre-criador__selo" aria-hidden="true">🌿</span>
              <div>
                <p className="sobre-criador__destaque">
                  Criado por {APP.AUTHOR}
                </p>
                <h2>Uma ideia feita para acolher</h2>
              </div>
            </div>

            <p>
              O Abrigo foi criado por Edryan Lopes com a ideia de oferecer um
              lugar pessoal para guardar momentos, acolher reflexões e cuidar da
              própria jornada. O projeto busca
              unir simplicidade, privacidade e acolhimento em uma experiência
              que respeita o tempo e as escolhas de cada pessoa.
            </p>

            <dl className="sobre-criador__detalhes">
              <div>
                <dt>Criador</dt>
                <dd>{APP.AUTHOR}</dd>
              </div>
              <div>
                <dt>Função</dt>
                <dd>idealizador e desenvolvedor</dd>
              </div>
              <div>
                <dt>Projeto</dt>
                <dd>{APP.NAME}</dd>
              </div>
            </dl>
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
              um grande significado. Guardar mensagens, perguntas e momentos é
              uma forma de deixar partes da nossa história por perto.
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
          <p>✨ {APP.NAME} {APP.VERSION} • Um lugar para guardar o que realmente importa.</p>
        </footer>
      </Container>
    </>
  );
}
