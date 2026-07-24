import "./JornadaAbrigo.css";

import Ceu from "../../../components/Ceu/Ceu";
import Navbar from "../../../components/Navbar/Navbar";
import Container from "../../../components/Container/Container";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Section from "../../../components/Section/Section";
import GlassCard from "../../../components/GlassCard/GlassCard";
import Divider from "../../../components/Divider/Divider";

const timeline = [
  {
    icon: "🌱",
    title: "Início do projeto",
    date: "17 de julho de 2026",
    description:
      "O nascimento do Abrigo, criado com a ideia de oferecer um espaço acolhedor para qualquer pessoa.",
  },
  {
    icon: "🏠",
    title: "Tela de Boas-vindas",
    description:
      "Primeira experiência do usuário ao entrar no Abrigo.",
  },
  {
    icon: "💌",
    title: "Cartas",
    description:
      "Mensagens pensadas para acolher, motivar e acompanhar diferentes momentos da vida.",
  },
  {
    icon: "📅",
    title: "Calendário",
    description:
      "Datas especiais e lembranças importantes passaram a fazer parte da experiência.",
  },
  {
    icon: "🎵",
    title: "Música",
    description:
      "Uma trilha sonora para tornar o ambiente ainda mais confortável.",
  },
  {
    icon: "⚙️",
    title: "Configurações",
    description:
      "Personalização do Abrigo para que cada pessoa tenha sua própria experiência.",
  },
  {
    icon: "👤",
    title: "Perfil do usuário",
    description:
      "O Abrigo passou a lembrar preferências e criar uma experiência mais pessoal.",
  },
  {
    icon: "📖",
    title: "Jornadas",
    description:
      "A história do Abrigo e a história de quem utiliza o aplicativo começaram a caminhar juntas.",
  },
];

const recursos = [
  "Bem-vindo",
  "Lar",
  "Cartas",
  "Calendário",
  "Música",
  "Configurações",
  "Contador do Abrigo",
  "Jornada do Abrigo",
  "Sua Jornada",
];

const futuras = [
  "Conquistas",
  "Diário",
  "Estatísticas",
  "Backup",
  "Sincronização",
  "Compartilhamento",
  "Novos temas",
];

export default function JornadaAbrigo() {
  return (
    <>
      <Ceu />
      <Navbar />

      <Container>
        <PageHeader
          title="Jornada do Abrigo"
          subtitle="Conheça como o Abrigo nasceu, evoluiu e continua crescendo."
        />

        <Section title="🌿 O começo">
          <GlassCard>
            <p>
              O Abrigo nasceu com um propósito simples: criar um espaço
              acolhedor, tranquilo e bonito, onde qualquer pessoa pudesse
              guardar lembranças, encontrar inspiração e fazer uma pausa na
              rotina.
            </p>

            <p>
              Desde o início, a ideia sempre foi desenvolver um lugar que
              transmitisse conforto, calma e leveza em cada detalhe.
            </p>
          </GlassCard>
        </Section>

        <Divider />

        <Section title="🎯 Nossa missão">
          <GlassCard>
            <p>
              Criar um ambiente digital acolhedor, onde cada visita seja um
              convite para desacelerar, refletir e aproveitar os pequenos
              momentos da vida.
            </p>
          </GlassCard>
        </Section>

        <Divider />

        <Section title="🚀 Evolução do projeto">
          <div className="timeline-grid">
            {timeline.map((item) => (
              <GlassCard key={item.title} hover>
                <h3>
                  {item.icon} {item.title}
                </h3>

                {item.date && <small>{item.date}</small>}

                <p>{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Divider />

        <Section title="🛠 Recursos disponíveis">
          <div className="timeline-grid">
            {recursos.map((recurso) => (
              <GlassCard key={recurso}>
                <h3>✅ {recurso}</h3>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Divider />

        <Section title="🔮 Próximas novidades">
          <div className="timeline-grid">
            {futuras.map((item) => (
              <GlassCard key={item}>
                <h3>⬜ {item}</h3>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Divider />

        <Section title="👨‍💻 Sobre o criador">
          <GlassCard>
            <p>
              O Abrigo foi idealizado e desenvolvido por <strong>Edryãn Lopes</strong>,
              com o objetivo de criar um lugar simples, bonito e acolhedor.
            </p>

            <p>
              Cada atualização representa um novo passo nessa jornada e um
              compromisso em tornar a experiência cada vez melhor.
            </p>
          </GlassCard>
        </Section>

        <Divider />

        <Section title="❤️ Obrigado">
          <GlassCard>
            <p>
              Obrigado por fazer parte da história do Abrigo.
            </p>

            <p>
              Cada visita, cada carta lida e cada momento vivido aqui ajudam
              este projeto a continuar crescendo.
            </p>

            <p>
              Espero que este lugar possa sempre oferecer um pouco de conforto,
              inspiração e tranquilidade quando você precisar.
            </p>

            <p>
              A sua privacidade também é muito importante. O Abrigo não vende,
              não compartilha e não utiliza suas informações pessoais para fins
              comerciais. Os dados salvos existem apenas para personalizar sua
              experiência e permanecem armazenados localmente no seu dispositivo,
              sempre sob o seu controle.
            </p>

            <p>
              Este é um espaço feito para acolher pessoas, não para coletar
              dados.
            </p>

            <p>
              Este ainda é apenas o começo da jornada, e muitas novidades
              continuarão chegando para tornar o Abrigo um lugar cada vez mais
              especial.
            </p>

            <p>
              <strong>Com carinho,</strong>
              <br />
              <strong>Edryãn Lopes</strong>
              <br />
              Criador do Abrigo
            </p>
          </GlassCard>
        </Section>
      </Container>
    </>
  );
}