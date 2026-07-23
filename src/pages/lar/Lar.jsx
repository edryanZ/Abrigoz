import "./Lar.css";

import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaEnvelopeOpenText,
  FaMusic,
  FaQuoteLeft,
} from "react-icons/fa";

import {
  ActionCard,
  Container,
  PageHeader,
  Section,
} from "../../components/layout";

import { FraseDoDia } from "../../components/common";

export default function Lar() {
  const navigate = useNavigate();

  const hora = new Date().getHours();

  let saudacao = "Boa noite";

  if (hora >= 5 && hora < 12) {
    saudacao = "Bom dia";
  } else if (hora >= 12 && hora < 18) {
    saudacao = "Boa tarde";
  }

  return (
    <Container>
      <PageHeader
        title={`${saudacao}.`}
        subtitle="Espero que este seja um bom momento para desacelerar. Escolha por onde deseja começar."
      />

      <Section>
        <ActionCard
          icon={<FaEnvelopeOpenText />}
          title="Cartas"
          description="Escolha uma categoria e encontre uma mensagem preparada para o momento que você está vivendo."
          buttonText="Abrir Cartas"
          onClick={() => navigate("/cartas")}
        />

        <ActionCard
          icon={<FaQuoteLeft />}
          title="Frase do Dia"
        >
          <FraseDoDia />
        </ActionCard>
      </Section>

      <Section>
        <ActionCard
          icon={<FaCalendarAlt />}
          title="Calendário"
          description="Acompanhe datas especiais, eventos e momentos importantes do Abrigo."
          buttonText="Abrir Calendário"
          onClick={() => navigate("/calendario")}
        />

        <ActionCard
          icon={<FaMusic />}
          title="Música"
          description="Sua trilha sonora estará disponível em breve para tornar a experiência ainda mais acolhedora."
          buttonText="Em breve"
        />
      </Section>

      <footer className="lar-footer">
        <p>Abrigo • versão 2.0</p>
      </footer>
    </Container>
  );
}