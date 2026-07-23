import { eventos } from "../../data/eventos";
import { mensagens } from "../../data/mensagens";
import { musicas } from "../../data/musicas";
import { cartasSecretas } from "../../data/cartasSecretas";
import { surpresas } from "../../data/surpresas";

export function buscarConteudoDia(dia, mes) {
  const mensagensDoDia = mensagens.filter(
    (mensagem) =>
      mensagem.dia === dia &&
      mensagem.mes === mes
  );

  const mensagensAleatorias = mensagens.filter(
    (mensagem) =>
      mensagem.dia === undefined &&
      mensagem.mes === undefined
  );

  const mensagemSelecionada =
    mensagensDoDia.length > 0
      ? mensagensDoDia
      : mensagensAleatorias.length > 0
      ? [
          mensagensAleatorias[
            Math.floor(
              Math.random() * mensagensAleatorias.length
            )
          ],
        ]
      : [];

  return {
    dia,
    mes,

    evento:
      eventos.find(
        (evento) =>
          evento.dia === dia &&
          evento.mes === mes
      ) || null,

    mensagens: mensagemSelecionada,

    musicas: musicas.filter(
      (musica) =>
        musica.dia === dia &&
        musica.mes === mes
    ),

    cartasSecretas: cartasSecretas.filter(
      (carta) =>
        carta.dia === dia &&
        carta.mes === mes
    ),

    surpresa:
      surpresas.find(
        (surpresa) =>
          surpresa.dia === dia &&
          surpresa.mes === mes
      ) || null,
  };
}