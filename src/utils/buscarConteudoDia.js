import { eventos } from "../data/eventos";
import { mensagens } from "../data/mensagens";
import { musicas } from "../data/musicas";
import { surpresas } from "../data/surpresas";

export function buscarConteudoDia(dia, mes) {
  const mensagensDoDia = mensagens.filter(
    ({ dia: d, mes: m }) => d === dia && m === mes
  );

  const mensagensAleatorias = mensagens.filter(
    ({ dia, mes }) => dia == null && mes == null
  );

  const mensagemSelecionada =
    mensagensDoDia.length > 0
      ? mensagensDoDia
      : mensagensAleatorias.length > 0
      ? [
          mensagensAleatorias[
            Math.floor(Math.random() * mensagensAleatorias.length)
          ],
        ]
      : [];

  return {
    dia,
    mes,

    evento:
      eventos.find(
        ({ dia: d, mes: m }) => d === dia && m === mes
      ) ?? null,

    mensagens: mensagemSelecionada,

    musicas: musicas.filter(
      ({ dia: d, mes: m }) => d === dia && m === mes
    ),

    surpresa:
      surpresas.find(
        ({ dia: d, mes: m }) => d === dia && m === mes
      ) ?? null,
  };
}