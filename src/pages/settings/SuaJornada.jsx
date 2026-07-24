import "./SuaJornada.css";

import { differenceInDays } from "date-fns";

import Ceu from "../../../components/Ceu/Ceu";
import Navbar from "../../../components/Navbar/Navbar";
import Container from "../../../components/Container/Container";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Section from "../../../components/Section/Section";
import GlassCard from "../../../components/GlassCard/GlassCard";
import Divider from "../../../components/Divider/Divider";

import { useJourney } from "../../../contexts/JourneyContext";
import { useUser } from "../../../contexts/UserContext";

export default function SuaJornada() {
  const { user } = useUser();

  const {
    streak,
    statistics,
    moods,
    achievements,
  } = useJourney();

  const createdAt = streak?.createdAt
    ? new Date(streak.createdAt)
    : new Date();

  const totalDays = differenceInDays(
    new Date(),
    createdAt
  );

  const lastMood =
    moods.length > 0 ? moods[0] : null;

  return (
    <>
      <Ceu />
      <Navbar />

      <Container>

        <PageHeader
          title="Sua Jornada"
          subtitle="Veja tudo o que você já viveu dentro do Abrigo."
        />

        <Section title="👤 Perfil">

          <GlassCard>

            <div className="journey-row">
              <span>Nome</span>
              <strong>{user?.name || "Visitante"}</strong>
            </div>

            <div className="journey-row">
              <span>Primeira visita</span>
              <strong>
                {createdAt.toLocaleDateString("pt-BR")}
              </strong>
            </div>

            <div className="journey-row">
              <span>Última visita</span>
              <strong>
                {streak.lastVisit
                  ? new Date(
                      streak.lastVisit
                    ).toLocaleDateString("pt-BR")
                  : "-"}
              </strong>
            </div>

          </GlassCard>

        </Section>

        <Divider />

        <Section title="⏳ Tempo no Abrigo">

          <GlassCard className="center-card">

            <h2>{totalDays} dias</h2>

            <p>
              Desde que sua jornada começou.
            </p>

          </GlassCard>

        </Section>

        <Divider />

        <Section title="🔥 Sequência">

          <div className="journey-grid">

            <GlassCard>

              <h3>Sequência atual</h3>

              <h2>{streak.currentStreak}</h2>

              <p>dias</p>

            </GlassCard>

            <GlassCard>

              <h3>Maior sequência</h3>

              <h2>{streak.longestStreak}</h2>

              <p>dias</p>

            </GlassCard>

          </div>

        </Section>

        <Divider />

        <Section title="📊 Estatísticas">

          <div className="journey-grid">

            <GlassCard>

              <h3>Cartas lidas</h3>

              <h2>{statistics.lettersRead}</h2>

            </GlassCard>

            <GlassCard>

              <h3>Carta do dia</h3>

              <h2>{statistics.dailyLettersRead}</h2>

            </GlassCard>

            <GlassCard>

              <h3>Humores</h3>

              <h2>{statistics.moodsRegistered}</h2>

            </GlassCard>

            <GlassCard>

              <h3>Conquistas</h3>

              <h2>{achievements.length}</h2>

            </GlassCard>

          </div>

        </Section>

        <Divider />

        <Section title="😊 Último humor">

          <GlassCard>

            {lastMood ? (
              <>

                <h2>{lastMood.mood}</h2>

                <p>

                  {new Date(
                    lastMood.createdAt
                  ).toLocaleDateString("pt-BR")}

                </p>

                {lastMood.note && (
                  <p>{lastMood.note}</p>
                )}

              </>
            ) : (
              <p>
                Você ainda não registrou nenhum humor.
              </p>
            )}

          </GlassCard>

        </Section>

        <Divider />

        <Section title="🏆 Conquistas">

          {achievements.length === 0 ? (

            <GlassCard>

              <p>
                Nenhuma conquista desbloqueada.
              </p>

            </GlassCard>

          ) : (

            <div className="journey-grid">

              {achievements.map((achievement) => (

                <GlassCard
                  key={achievement.id}
                >

                  <h2>
                    {achievement.icon}
                  </h2>

                  <h3>
                    {achievement.title}
                  </h3>

                  <p>
                    {achievement.description}
                  </p>

                </GlassCard>

              ))}

            </div>

          )}

        </Section>

        <Divider />

        <Section title="📜 Histórico">

          <GlassCard>

            <ul className="history-list">

              <li>
                🌱 Primeira visita ao Abrigo
              </li>

              <li>
                👤 Perfil criado
              </li>

              {statistics.lettersRead > 0 && (
                <li>
                  💌 Primeira carta lida
                </li>
              )}

              {statistics.moodsRegistered > 0 && (
                <li>
                  😊 Primeiro humor registrado
                </li>
              )}

              {streak.currentStreak >= 7 && (
                <li>
                  🔥 Sequência de 7 dias
                </li>
              )}

            </ul>

          </GlassCard>

        </Section>

      </Container>
    </>
  );
}