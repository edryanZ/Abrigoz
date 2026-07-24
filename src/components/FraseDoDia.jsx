import "./FraseDoDia.css";
import { useMemo } from "react";
const frases = [
  "Respire fundo. Você chegou até aqui e isso já é uma grande conquista.",
  "Hoje pode ser um bom dia para recomeçar.",
  "Você é mais forte do que imagina.",
  "Tudo bem ir devagar, o importante é continuar.",
  "Pequenos passos também levam longe.",
  "Nem toda tempestade dura para sempre.",
  "Você merece descansar sem sentir culpa.",
  "Seu tempo é diferente do tempo dos outros, e tudo bem.",
  "Sempre existe um motivo para continuar.",
  "As melhores mudanças começam aos poucos.",
  "Você não precisa resolver tudo hoje.",
  "Confie mais em si mesmo.",
  "Cada novo amanhecer traz novas possibilidades.",
  "Sua história ainda está sendo escrita.",
  "A esperança floresce até nos dias mais difíceis.",
  "Não tenha medo de começar novamente.",
  "Você merece viver dias tranquilos.",
  "Permita-se sentir orgulho da sua caminhada.",
  "Há beleza até nos pequenos momentos.",
  "Nunca subestime o poder de um sorriso.",
  "Você já venceu desafios que pareciam impossíveis.",
  "Respirar também é uma forma de seguir em frente.",
  "Tudo acontece no tempo certo.",
  "Seu coração merece paz.",
  "Valorize cada pequena conquista.",
  "Sempre haverá um novo começo esperando por você.",
  "O amanhã pode surpreender você.",
  "A gentileza transforma o mundo.",
  "Olhe para trás e veja o quanto você evoluiu.",
  "Você é suficiente.",
  "Dias ruins também passam.",
  "Continue acreditando em dias melhores.",
  "Até as árvores crescem devagar.",
  "A calma também é uma vitória.",
  "Seu esforço vale a pena.",
  "Não compare sua caminhada com a de ninguém.",
  "Você merece ser feliz.",
  "Nunca deixe de acreditar nos seus sonhos.",
  "A coragem aparece quando você decide continuar.",
  "Tudo bem fazer uma pausa.",
  "A felicidade mora nas coisas simples.",
  "Você não está sozinho.",
  "Sempre existe uma nova oportunidade.",
  "O melhor ainda pode estar por vir.",
  "Cada dia é uma nova chance.",
  "A luz sempre encontra um caminho.",
  "Permita-se descansar um pouco.",
  "As pequenas alegrias fazem grandes dias.",
  "Seu sorriso ilumina mais do que imagina.",
  "Você já percorreu um longo caminho.",
  "O amor também está nos detalhes.",
  "Confie no processo.",
  "Toda flor tem seu tempo para florescer.",
  "Mesmo devagar, você está avançando.",
  "A vida também acontece nos momentos simples.",
  "Seu coração merece leveza.",
  "A paz começa dentro de você.",
  "Nunca é tarde para mudar.",
  "Cada passo conta.",
  "Você merece viver com tranquilidade.",
  "As dificuldades ensinam mais do que imaginamos.",
  "Você pode superar este momento.",
  "Ainda há muitas coisas bonitas esperando por você.",
  "Seja paciente consigo mesmo.",
  "Sua presença faz diferença.",
  "Hoje escolha ser gentil consigo.",
  "Permita-se sonhar novamente.",
  "A esperança nunca chega tarde.",
  "Toda caminhada começa com o primeiro passo.",
  "Você é capaz de muito mais do que acredita.",
  "O silêncio também pode trazer respostas.",
  "Não tenha medo de descansar.",
  "Seu futuro começa nas escolhas de hoje.",
  "A vida recompensa a persistência.",
  "Leve apenas o que faz bem ao coração.",
  "Você merece paz de espírito.",
  "Sempre existe algo bom esperando por você.",
  "Grandes mudanças começam discretamente.",
  "O carinho também mora nas pequenas atitudes.",
  "Você merece dias leves.",
  "Olhe para o céu e lembre-se de respirar.",
  "Nunca deixe de acreditar em você.",
  "Tudo bem pedir ajuda.",
  "A felicidade também está nas pequenas vitórias.",
  "Seu caminho é único.",
  "Há força na calma.",
  "Cada dia vivido é uma oportunidade de crescer.",
  "Você já é motivo de orgulho.",
  "A vida sempre encontra um jeito de florescer.",
  "Nem sempre será fácil, mas sempre valerá a pena continuar.",
  "Você merece viver em paz.",
  "Não desista por causa de um dia difícil.",
  "O amor começa pelo cuidado consigo mesmo.",
  "Continue sem pressa.",
  "Há beleza no agora.",
  "Seu coração sabe o caminho.",
  "Mesmo quando tudo parece parado, você continua crescendo.",
  "Nunca deixe de acreditar na possibilidade de dias melhores.",
  "A vida fica mais leve quando você aprende a respirar.",
  "Hoje é um bom dia para cuidar de você.",
  "Você merece viver momentos que façam seu coração sorrir."
];
const categorias = {
  paz: [
    "Respire. Nem tudo precisa ser resolvido hoje.",
    "A calma também é uma forma de seguir em frente.",
    "Silêncio também pode ser um abraço.",
    "Permita que seu coração descanse um pouco.",
    "Você não precisa carregar tudo sozinho.",
  ],

  autoestima: [
    "Você é suficiente exatamente como é.",
    "Seu valor não depende da opinião dos outros.",
    "Acredite mais em você.",
    "Cada pessoa tem seu próprio tempo de florescer.",
    "Você merece carinho, inclusive o seu.",
  ],

  esperança: [
    "Dias difíceis também chegam ao fim.",
    "Sempre existe um novo amanhecer esperando por você.",
    "A esperança encontra espaço mesmo nas pequenas coisas.",
    "Hoje pode ser o começo de algo bonito.",
    "Nunca subestime a força de um novo dia.",
  ],

  coragem: [
    "Você já enfrentou momentos difíceis antes.",
    "Mesmo devagar, continue caminhando.",
    "A coragem nem sempre faz barulho.",
    "Cada passo conta.",
    "O importante é não desistir de você.",
  ],

  recomeço: [
    "Nunca é tarde para começar outra vez.",
    "Recomeçar também é um ato de coragem.",
    "Hoje é uma nova oportunidade.",
    "Você pode escrever uma nova história.",
    "Todo recomeço merece uma chance.",
  ],

  gratidao: [
    "Agradeça pelas pequenas vitórias.",
    "Até os dias comuns guardam momentos especiais.",
    "A felicidade costuma morar nas coisas simples.",
    "Olhe ao redor. Sempre existe algo bom acontecendo.",
    "Valorize o presente que este momento oferece.",
  ],

  descanso: [
    "Descansar também faz parte da caminhada.",
    "Nem toda pausa significa desistir.",
    "Seu corpo e sua mente agradecem quando você desacelera.",
    "Tudo bem parar um pouco.",
    "Respire fundo. Você merece esse momento.",
  ],

  felicidade: [
    "Sorria sempre que puder.",
    "A alegria costuma aparecer onde existe esperança.",
    "Compartilhe gentileza.",
    "A felicidade cresce quando dividida.",
    "Hoje pode render uma boa lembrança.",
  ],
};

const todasFrases = Object.values(categorias).flat();

export default function FraseDoDia() {
  const frase = useMemo(() => {
    const hoje = new Date();

    const numeroDoDia = Math.floor(
      (hoje - new Date(2026, 0, 1)) / 86400000
    );

    return todasFrases[numeroDoDia % todasFrases.length];
  }, []);

  return (
    <section
      className="frase-dia"
      aria-labelledby="titulo-frase"
    >
      <span className="frase-tag">
        ✨ Frase do dia
      </span>

      <h2 id="titulo-frase">
        Uma inspiração para você
      </h2>

      <blockquote>
        "{frase}"
      </blockquote>
    </section>
  );
}