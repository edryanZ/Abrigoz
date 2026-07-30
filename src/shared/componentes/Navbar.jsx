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
  FaStar,
  FaBullseye,
  FaLeaf,
  FaChartBar,
  FaSearch,
  FaTrophy,
} from "react-icons/fa";

import MusicPlayer from "./MusicPlayer";
import ROUTES from "../../core/constants/routes";

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

  const grupos = [
    {
      nome: "Abrigo",
      itens: [
        { nome: "Lar", rota: ROUTES.HOME, icone: <FaHome /> },
        { nome: "Cartas", rota: ROUTES.LETTERS, icone: <FaEnvelope /> },
        { nome: "Pesquisa", rota: ROUTES.SEARCH, icone: <FaSearch /> },
        { nome: "Estatísticas", rota: ROUTES.STATISTICS, icone: <FaChartBar /> },
        { nome: "Conquistas", rota: ROUTES.ACHIEVEMENTS, icone: <FaTrophy /> },
      ],
    },
    {
      nome: "Organização pessoal",
      itens: [
        {
          nome: "Calendário",
          rota: ROUTES.CALENDAR,
          icone: <FaCalendarAlt />,
        },
        { nome: "Favoritos", rota: ROUTES.FAVORITES, icone: <FaStar /> },
        { nome: "Metas", rota: ROUTES.GOALS, icone: <FaBullseye /> },
        { nome: "Hábitos", rota: ROUTES.HABITS, icone: <FaLeaf /> },
      ],
    },
    {
      nome: "Aplicativo",
      itens: [
        { nome: "Sobre", rota: ROUTES.ABOUT, icone: <FaHeart /> },
        {
          nome: "Configurações",
          rota: ROUTES.SETTINGS,
          icone: <FaCog />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Barra superior */}

      <header className="navbar-top">
        <button
          type="button"
          className="navbar-icon"
          onClick={abrirMenu}
          aria-label="Abrir menu de navegação"
        >
          <FaBars />
        </button>

        <h1 className="navbar-logo">
          Abrigo
        </h1>

        <button
          type="button"
          className="navbar-icon"
          onClick={abrirPlayer}
          aria-label="Abrir reprodutor de música"
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
            type="button"
            className="fechar-menu"
            onClick={fecharMenu}
            aria-label="Fechar menu de navegação"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="menu-links">
          {grupos.map((grupo) => (
            <section className="menu-group" key={grupo.nome}>
              <h3>{grupo.nome}</h3>
              {grupo.itens.map((item) => {
                const ativo = pathname === item.rota;
                return (
                  <Link
                    key={item.rota}
                    to={item.rota}
                    className={ativo ? "ativo" : ""}
                    onClick={fecharMenu}
                  >
                    <span className="icone">{item.icone}</span>
                    {item.nome}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
      </aside>

      <MusicPlayer
        aberto={playerAberto}
        fechar={fecharPlayer}
      />
    </>
  );
}
