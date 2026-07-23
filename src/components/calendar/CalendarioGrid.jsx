import "./CalendarioGrid.css";

import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import ModalEvento from "./ModalEvento";
import useCalendario from "./useCalendario";

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

          <h2>
            {meses[mesAtual]} {anoAtual}
          </h2>

          <button
            type="button"
            className="btn-mes"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
          >
            <FaChevronRight />
          </button>
        </header>

        <div className="dias-semana">
          {diasSemana.map((dia) => (
            <span key={dia}>{dia}</span>
          ))}
        </div>

        <div className="grade-calendario">
          {dias.map((item) => {
            if (item.vazio) {
              return (
                <div
                  key={item.key}
                  className="dia vazio"
                  aria-hidden="true"
                />
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                className={`dia ${item.hoje ? "hoje" : ""}`}
                onClick={() => abrirDia(item.dia)}
                aria-label={`Abrir informações do dia ${item.dia}`}
              >
                <span>{item.dia}</span>

                {item.possuiConteudo && (
                  <span
                    className="emoji-evento"
                    aria-hidden="true"
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