// src/components/Navbar.jsx

import "./Navbar.css";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FaBars,
  FaTimes,
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaHeart,
  FaMusic,
  FaCog,
} from "react-icons/fa";

import MusicPlayer from "./MusicPlayer";

export default function Navbar() {
  const { pathname } = useLocation();

  const menuRef = useRef(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [playerAberto, setPlayerAberto] = useState(false);

  const abrirMenu = () => setMenuAberto(true);
  const fecharMenu = () => setMenuAberto(false);

  const abrirPlayer = () => setPlayerAberto(true);
  const fecharPlayer = () => setPlayerAberto(false);

  useEffect(() => {
    if (!menuAberto) return;

    document.body.style.overflow = "hidden";

    function handleKey(event) {
      if (event.key === "Escape") {
        fecharMenu();
      }
    }

    function handleClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        fecharMenu();
      }
    }

    window.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuAberto]);

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

    {
      nome: "Configurações",
      rota: "/configuracoes",
      icone: <FaCog />,
    },
  ];

  return (
    <>
      {/* Barra superior */}

      <header className="navbar-top">
        <button
          className="navbar-icon"
          onClick={abrirMenu}
        >
          <FaBars />
        </button>

        <h1 className="navbar-logo">
          Abrigo
        </h1>

        <button
          className="navbar-icon"
          onClick={abrirPlayer}
        >
          <FaMusic />
        </button>
      </header>

      {menuAberto && (
        <div
          className="menu-backdrop"
          onClick={fecharMenu}
        />
      )}

      <aside
        ref={menuRef}
        className={`menu-lateral ${menuAberto ? "aberto" : ""}`}
      >
        <div className="menu-topo">
          <div>
            <h2>Abrigo</h2>

            <p>
              Um lugar para guardar
              momentos,
              lembranças
              e histórias.
            </p>
          </div>

          <button
            className="fechar-menu"
            onClick={fecharMenu}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="menu-links">
          {itens.map((item) => {
            const ativo = pathname === item.rota;

            return (
              <Link
                key={item.rota}
                to={item.rota}
                className={ativo ? "ativo" : ""}
                onClick={fecharMenu}
              >
                <span className="icone">
                  {item.icone}
                </span>

                {item.nome}
              </Link>
            );
          })}
        </nav>
      </aside>

      <MusicPlayer
        aberto={playerAberto}
        fechar={fecharPlayer}
      />
    </>
  );
}