import { useCallback, useMemo, useState } from "react";

import { eventos } from "../../../data/eventos";
import { musicas } from "../../../data/musicas";
import { surpresas } from "../../../data/surpresas";

import { buscarConteudoDia } from "../../../core/utils/buscarConteudoDia";

export default function useCalendario() {

  const hoje = useMemo(() => new Date(), []);

  const [dataAtual, setDataAtual] = useState(
    new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    )
  );

  const [diaSelecionado, setDiaSelecionado] = useState(
    hoje.getDate()
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

  const mudarMes = useCallback((direcao) => {

    setDataAtual((atual) => {

      const nova = new Date(
        atual.getFullYear(),
        atual.getMonth() + direcao,
        1
      );

      return nova;

    });

  }, []);

  const irParaHoje = useCallback(() => {

    setDataAtual(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )
    );

    setDiaSelecionado(hoje.getDate());

  }, [hoje]);

  const abrirDia = useCallback((dia) => {

    setDiaSelecionado(dia);

    const conteudo = buscarConteudoDia(
      dia,
      mesAtual + 1
    );

    setConteudoDia(conteudo);

    setModalAberto(true);

  }, [mesAtual]);

  const fecharModal = useCallback(() => {

    setConteudoDia(null);

    setModalAberto(false);

  }, []);

  const possuiConteudo = useCallback((dia) => {

    const mes = mesAtual + 1;

    return (

      eventos.some(
        ({ dia: d, mes: m }) =>
          d === dia && m === mes
      )

      ||

      musicas.some(
        ({ dia: d, mes: m }) =>
          d === dia && m === mes
      )

      ||

      surpresas.some(
        ({ dia: d, mes: m }) =>
          d === dia && m === mes
      )

    );

  }, [mesAtual]);

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

      lista.push({

        key: `dia-${dia}`,

        dia,

        vazio: false,

        ativo: dia === diaSelecionado,

        hoje:
          dia === hoje.getDate() &&
          mesAtual === hoje.getMonth() &&
          anoAtual === hoje.getFullYear(),

        possuiConteudo: possuiConteudo(dia),

      });

    }

    return lista;

  }, [
    anoAtual,
    mesAtual,
    hoje,
    diaSelecionado,
    possuiConteudo,
  ]);

  return {

    hoje,

    meses,

    diasSemana,

    dias,

    dataAtual,

    mesAtual,

    anoAtual,

    diaSelecionado,

    modalAberto,

    conteudoDia,

    mudarMes,

    irParaHoje,

    abrirDia,

    fecharModal,

  };

}