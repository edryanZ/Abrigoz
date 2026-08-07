import { localDateKey } from "../intelligence/localDates.js";

const MOMENTS = Object.freeze([
  ["calma", "Nem todo dia precisa ter grandes acontecimentos para ter valido a pena.", "Escolha alguma coisa hoje para fazer sem transformar em obrigação."],
  ["descanso", "Descansar também é uma forma de continuar.", "Se puder, deixe alguns minutos do dia sem destino definido."],
  ["gratidão", "Algumas coisas pequenas merecem ser lembradas com carinho.", "Repare em algo simples que fez companhia a você hoje."],
  ["coragem", "Coragem também pode ser ir devagar.", "Dê a si mesmo espaço para fazer só o que couber hoje."],
  ["autoestima", "Você não precisa provar seu valor em todos os dias.", "Fale consigo com a mesma gentileza que ofereceria a alguém querido."],
  ["amizade", "Algumas presenças deixam o caminho mais leve.", "Lembre de alguém cuja companhia faz bem, sem obrigação de fazer nada com isso."],
  ["saudade", "Sentir saudade também é uma forma de reconhecer o que foi importante.", "Deixe uma lembrança boa passar por você sem precisar segurá-la."],
  ["esperança", "Nem tudo precisa estar resolvido para existir um pouco de esperança.", "Olhe apenas para o próximo pedaço do caminho, no seu tempo."],
  ["pequenas alegrias", "Um momento bom não precisa ser grande para ser verdadeiro.", "Repare em alguma coisa agradável que normalmente passaria depressa."],
  ["gentileza consigo", "Hoje você pode se tratar com um pouco menos de cobrança.", "Escolha uma exigência que pode ficar para outro momento."],
  ["desacelerar", "Ir mais devagar não significa estar ficando para trás.", "Faça uma pausa curta antes de seguir para a próxima coisa."],
  ["presença", "Este instante não precisa virar lembrança, tarefa ou resultado.", "Fique alguns segundos onde você já está."],
  ["lembranças", "Há dias que continuam aquecendo a gente mesmo depois de passar.", "Pense em uma lembrança simples que ainda traz alguma ternura."],
  ["recomeços", "Recomeçar não precisa parecer uma grande decisão.", "Se algo pedir um novo começo, deixe que ele seja pequeno."],
  ["dias difíceis", "Um dia difícil não diz tudo sobre você nem sobre a sua história.", "Se fizer sentido, deixe o dia passar no ritmo que for possível para você."],
  ["contemplação", "Nem todo silêncio precisa ser preenchido.", "Observe por um instante a luz, o céu ou algum detalhe perto de você."],
  ["calma", "Você não precisa resolver a semana inteira hoje.", "Deixe o futuro quieto por alguns minutos."],
  ["descanso", "Pausas não precisam ser merecidas.", "Se tiver vontade, reserve um instante sem transformar o descanso em meta."],
  ["pequenas alegrias", "Coisas boas também acontecem baixinho.", "Tente notar uma delas antes que o dia termine."],
  ["recomeços", "Você pode mudar de ideia sem transformar isso em fracasso.", "Permita que algo tome outra direção, se fizer sentido."],
]);

const REFLECTIONS = Object.freeze([
  "Que coisa simples aconteceu recentemente e você gostaria de não esquecer?",
  "O que deixou seu dia um pouco mais leve?",
  "Tem alguma coisa que você gostaria de ouvir de alguém hoje?",
  "Que momento recente fez você sorrir sem perceber?",
  "O que tem sido um pequeno conforto nos seus dias?",
  "Que lugar, som ou cheiro costuma trazer uma lembrança boa?",
  "O que você gostaria de fazer com mais calma?",
  "Qual foi a última coisa simples que surpreendeu você de um jeito bom?",
  "Tem alguma lembrança que merece uma visita carinhosa hoje?",
  "O que você pode deixar para amanhã sem culpa?",
  "Que parte do seu dia você gostaria de guardar só como ela foi?",
  "O que tem feito você se sentir um pouco mais em casa?",
]);

const CARES = Object.freeze([
  "Ouça uma música que você gosta sem fazer outra coisa ao mesmo tempo.",
  "Olhe pela janela por alguns minutos.",
  "Beba um pouco de água, sem pressa.",
  "Mande uma mensagem para alguém de quem você gosta, se tiver vontade.",
  "Faça alguma coisa hoje apenas porque é agradável.",
  "Fique alguns minutos longe das notificações.",
  "Mude de posição ou faça uma pausa breve, se isso parecer confortável.",
  "Escolha uma música que combine com o seu momento.",
  "Repare no céu por alguns instantes.",
  "Deixe uma tarefa não urgente para depois, se isso couber no seu dia.",
  "Prepare alguma coisa simples de que você gosta.",
  "Sente-se em um lugar confortável e não faça nada por um minuto.",
]);

const INTENTIONS = Object.freeze([
  "Quero me cobrar menos esta semana.",
  "Quero notar com mais calma o que acontece ao meu redor.",
  "Quero reservar um pouco de tempo para mim.",
  "Quero respeitar mais o meu próprio ritmo.",
  "Quero deixar algumas coisas serem apenas simples.",
  "Quero lembrar que descansar não precisa de justificativa.",
]);

function seed(text) {
  let value = 2166136261;
  for (const character of text) {
    value ^= character.codePointAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function localDayOrdinal(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const daysBeforeMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const previousYear = year - 1;
  const daysBeforeYear = previousYear * 365
    + Math.floor(previousYear / 4)
    - Math.floor(previousYear / 100)
    + Math.floor(previousYear / 400);
  const leapDay = month > 1 && isLeapYear(year) ? 1 : 0;
  return daysBeforeYear + daysBeforeMonth[month] + leapDay + day;
}

function dailyItem(items, salt, date = new Date()) {
  const dateKey = localDateKey(date);
  const offset = seed(salt) % items.length;
  const index = (localDayOrdinal(date) + offset) % items.length;
  return { dateKey, value: items[index] };
}

export function getDailyMoment(date = new Date()) {
  const { dateKey, value } = dailyItem(MOMENTS, "moment", date);
  return { dateKey, category: value[0], message: value[1], invitation: value[2] };
}

export function getDailyReflection(date = new Date()) {
  const { dateKey, value } = dailyItem(REFLECTIONS, "reflection", date);
  return { dateKey, id: `reflection-${dateKey}`, question: value };
}

export function getDailyCare(date = new Date()) {
  const { dateKey, value } = dailyItem(CARES, "care", date);
  return { dateKey, text: value };
}

export function getSuggestedIntentions() {
  return [...INTENTIONS];
}

export { CARES as CARE_SUGGESTIONS };
