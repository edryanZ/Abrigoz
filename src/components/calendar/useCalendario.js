import { useMemo, useState } from "react";

import { eventos } from "../../data/eventos";
import { musicas } from "../../data/musicas";
import { surpresas } from "../../data/surpresas";

import { buscarConteudoDia } from "../../utils/calendario/buscarConteudoDia";

export default function useCalendario() {
  const hoje = new Date();

  const [dataAtual, setDataAtual] = useState(
    new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    )
  );

  const [modalAberto, setModalAberto] = useState(false);
  const [conteudoDia, setConteudoDia] = useState(null);

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const diasSemana = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
  ];

  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();

  function mudarMes(valor) {
    setDataAtual(
      new Date(
        anoAtual,
        mesAtual + valor,
        1
      )
    );
  }

  function abrirDia(dia) {
    const conteudo = buscarConteudoDia(
      dia,
      mesAtual + 1
    );

    setConteudoDia(conteudo);
    setModalAberto(true);
  }

  function fecharModal() {
    setConteudoDia(null);
    setModalAberto(false);
  }

  const dias = useMemo(() => {
    const primeiroDia = new Date(
      anoAtual,
      mesAtual,
      1
    ).getDay();

    const diasNoMes = new Date(
      anoAtual,
      mesAtual + 1,
      0
    ).getDate();

    const lista = [];

    for (let i = 0; i < primeiroDia; i++) {
      lista.push({
        vazio: true,
        key: `vazio-${i}`,
      });
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const possuiConteudo =
        eventos.some(
          (evento) =>
            evento.dia === dia &&
            evento.mes === mesAtual + 1
        ) ||
        musicas.some(
          (musica) =>
            musica.dia === dia &&
            musica.mes === mesAtual + 1
        ) ||
        surpresas.some(
          (surpresa) =>
            surpresa.dia === dia &&
            surpresa.mes === mesAtual + 1
        );

      const hojeClasse =
        dia === hoje.getDate() &&
        mesAtual === hoje.getMonth() &&
        anoAtual === hoje.getFullYear();

      lista.push({
        key: `dia-${dia}`,
        dia,
        vazio: false,
        hoje: hojeClasse,
        possuiConteudo,
      });
    }

    return lista;
  }, [anoAtual, mesAtual]);

  return {
    hoje,

    meses,
    diasSemana,

    dias,

    anoAtual,
    mesAtual,

    dataAtual,

    modalAberto,
    conteudoDia,

    mudarMes,
    abrirDia,
    fecharModal,
  };
}