import "./Navbar.css";

import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaHeart,
  FaTimes,
} from "react-icons/fa";

export default function Navbar({ aberto, fechar }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!aberto) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        fechar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [aberto, fechar]);

  const itens = [
    {
      nome: "Lar",
      rota: "/lar",
      icone: <FaHome />,
    },
    {
      nome: "Calendário",
      rota: "/calendario",
      icone: <FaCalendarAlt />,
    },
    {
      nome: "Cartas",
      rota: "/cartas",
      icone: <FaEnvelope />,
    },
    {
      nome: "Sobre",
      rota: "/sobre",
      icone: <FaHeart />,
    },
  ];

  return (
    <aside
      className={`menu-lateral ${
        aberto ? "aberto" : ""
      }`}
      aria-hidden={!aberto}
    >
      <div className="menu-topo">
        <div>
          <h2>Abrigo</h2>

          <p>
            Um lugar para guardar momentos,
            lembranças e histórias.
          </p>
        </div>

        <button
          type="button"
          className="fechar-menu"
          onClick={fechar}
          aria-label="Fechar menu"
        >
          <FaTimes />
        </button>
      </div>

      <nav
        className="menu-links"
        aria-label="Menu principal"
      >
        {itens.map((item) => {
          const ativo = pathname === item.rota;

          return (
            <Link
              key={item.rota}
              to={item.rota}
              onClick={fechar}
              className={ativo ? "ativo" : ""}
              aria-current={
                ativo ? "page" : undefined
              }
            >
              <span
                className="icone"
                aria-hidden="true"
              >
                {item.icone}
              </span>

              <span>{item.nome}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}