import "./Calendario.css";

import {
  Container,
  GlassCard,
  PageHeader,
  Section,
} from "../../components/layout";

import { CalendarioGrid } from "../../components/calendar";

export default function Calendario() {
  return (
    <Container>
      <PageHeader
        greeting="📅 Calendário"
        title="Momentos Especiais"
        subtitle="Explore datas importantes, mensagens, músicas, cartas e lembranças guardadas no Abrigo."
      />

      <Section>
        <GlassCard className="calendario-card">
          <CalendarioGrid />
        </GlassCard>
      </Section>
    </Container>
  );
}