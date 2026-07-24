import "./CalendarioGrid.css";

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
} from "react-icons/fa";

import ModalEvento from "./ModalEvento";
import useCalendario from "../hooks/useCalendario";

export default function CalendarioGrid() {

  const {

    meses,
    diasSemana,
    dias,

    mesAtual,
    anoAtual,

    modalAberto,
    conteudoDia,

    mudarMes,
    abrirDia,
    fecharModal,
    irParaHoje,

  } = useCalendario();

  return (
    <>

      <div className="calendario-grid-container">

        <header className="calendario-header">

          <button
            type="button"
            className="btn-mes"
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
          >
            <FaChevronLeft />
          </button>

          <div className="titulo-calendario">

            <span className="subtitulo">
              Calendário do Abrigo
            </span>

            <h2>
              {meses[mesAtual]} {anoAtual}
            </h2>

          </div>

          <button
            type="button"
            className="btn-mes"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
          >
            <FaChevronRight />
          </button>

        </header>

        <div className="toolbar-calendario">

          <button
            type="button"
            className="btn-hoje"
            onClick={irParaHoje}
          >
            <FaCalendarDay />

            <span>Hoje</span>

          </button>

        </div>

        <div className="dias-semana">

          {diasSemana.map((dia) => (

            <span key={dia}>
              {dia}
            </span>

          ))}

        </div>

        <div className="grade-calendario">

          {dias.map((item) => {

            if (item.vazio) {

              return (
                <div
                  key={item.key}
                  className="dia vazio"
                />
              );

            }

            return (

              <button
                key={item.key}
                type="button"
                onClick={() => abrirDia(item.dia)}
                className={`dia
                  ${item.hoje ? "hoje" : ""}
                  ${item.ativo ? "ativo" : ""}
                  ${item.possuiConteudo ? "evento" : ""}
                `}
              >

                <span className="numero-dia">
                  {item.dia}
                </span>

                {item.possuiConteudo && (

                  <span
                    className="emoji-evento"
                    title="Existe conteúdo neste dia"
                  >
                    ✨
                  </span>

                )}

              </button>

            );

          })}

        </div>

      </div>

      <ModalEvento
        aberto={modalAberto}
        conteudo={conteudoDia}
        onClose={fecharModal}
      />

    </>
  );

}