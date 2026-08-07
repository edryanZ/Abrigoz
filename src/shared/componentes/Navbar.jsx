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
  FaLeaf,
  FaSearch,
  FaFileExport,
  FaBookOpen,
  FaMoon,
} from "react-icons/fa";

import MusicPlayer from "./MusicPlayer";
import ROUTES from "../../core/constants/routes";
import { APP } from "../../core/constants/app";
import { useMusic } from "../contexts/MusicContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const music = useMusic();

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const playerButtonRef = useRef(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [playerAberto, setPlayerAberto] = useState(false);

  const abrirMenu = () => setMenuAberto(true);
  const fecharMenu = () => {
    setMenuAberto(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const abrirPlayer = () => setPlayerAberto(true);
  const fecharPlayer = () => {
    setPlayerAberto(false);
    requestAnimationFrame(() => playerButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!menuAberto) return;

    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => {
      menuRef.current?.querySelector("button")?.focus();
    });

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
      cancelAnimationFrame(focusFrame);

      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuAberto]);

  const grupos = [
    {
      nome: "Principal",
      itens: [
        { nome: "Lar", rota: ROUTES.HOME, icone: <FaHome /> },
        { nome: "Momento do Dia", rota: ROUTES.MOMENT, icone: <FaHeart /> },
        { nome: "Só ficar", rota: ROUTES.PAUSE, icone: <FaMoon /> },
        { nome: "Reflexões", rota: ROUTES.DIARY, icone: <FaBookOpen /> },
        { nome: "Cartas", rota: ROUTES.LETTERS, icone: <FaEnvelope /> },
        { nome: "Coisas que fazem bem", rota: ROUTES.FAVORITES, icone: <FaHeart /> },
      ],
    },
    {
      nome: "Seu espaço",
      itens: [
        { nome: "Pequenos Cuidados", rota: ROUTES.HABITS, icone: <FaLeaf /> },
        { nome: "Intenções", rota: ROUTES.GOALS, icone: <FaHeart /> },
        { nome: "Meu Dia", rota: ROUTES.CALENDAR, icone: <FaCalendarAlt /> },
        { nome: "Retrospectiva", rota: ROUTES.STATISTICS, icone: <FaBookOpen /> },
      ],
    },
    {
      nome: "Mais",
      itens: [
        { nome: "Pesquisa", rota: ROUTES.SEARCH, icone: <FaSearch /> },
        { nome: "Exportar", rota: ROUTES.EXPORT, icone: <FaFileExport /> },
        {
          nome: "Configurações",
          rota: ROUTES.SETTINGS,
          icone: <FaCog />,
        },
        { nome: "Sobre", rota: ROUTES.ABOUT, icone: <FaHeart /> },
      ],
    },
  ];

  return (
    <>
      {/* Barra superior */}

      <header className="navbar-top">
        <button
          ref={menuButtonRef}
          type="button"
          className="navbar-icon"
          onClick={abrirMenu}
          aria-label="Abrir menu de navegação"
        >
          <FaBars />
        </button>

        <Link to={ROUTES.HOME} className="navbar-logo" aria-label="Abrigo, ir para o Lar">
          <span className="abrigo-symbol" aria-hidden="true">
            <img src="/branding/favicon-32.png" alt="" />
          </span>
          <span>Abrigo</span>
        </Link>

        <button
          ref={playerButtonRef}
          type="button"
          className="navbar-icon"
          onClick={abrirPlayer}
          aria-label="Abrir reprodutor de música"
          disabled={!music.preferences.enabled}
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
        aria-label="Menu principal"
        aria-hidden={!menuAberto}
        inert={menuAberto ? undefined : ""}
      >
        <div className="menu-topo">
          <div>
            <h2>Abrigo</h2>

            <p>
              Um espaço de acolhimento,
              reflexão e motivação leve.
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
                    aria-current={ativo ? "page" : undefined}
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
        <footer className="menu-footer">
          <p>Cuide de você, um dia de cada vez.</p>
          <small>v{APP.VERSION} · Criado por {APP.AUTHOR}</small>
        </footer>
      </aside>

      <MusicPlayer
        aberto={playerAberto}
        fechar={fecharPlayer}
      />
      {music.preferences.enabled && music.preferences.miniPlayer && music.tocando &&
        !playerAberto && <button type="button" className="music-mini-player"
          onClick={abrirPlayer} aria-label="Abrir música em reprodução">
          <FaMusic /><span>{music.musica?.titulo}</span>
          <span aria-hidden="true">• {music.musica?.artista}</span>
        </button>}
    </>
  );
}
