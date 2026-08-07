// src/components/Navbar.jsx

import "./Navbar.css";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  FaClock,
  FaSlidersH,
} from "react-icons/fa";

import MusicPlayer from "./MusicPlayer";
import ROUTES from "../../core/constants/routes";
import { APP } from "../../core/constants/app";
import { useMusic } from "../contexts/MusicContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import {
  NAV_DESTINATIONS, isNavigationItemVisible, loadNavigationPreferences,
} from "../../core/personalization/NavigationPreferencesService";

export default function Navbar() {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const music = useMusic();
  const workspace = useWorkspace();

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const playerButtonRef = useRef(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [playerAberto, setPlayerAberto] = useState(false);
  const [navigationPreferences, setNavigationPreferences] = useState(
    loadNavigationPreferences
  );

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

  useEffect(() => {
    const refresh = (event) => setNavigationPreferences(
      event.detail ?? loadNavigationPreferences()
    );
    window.addEventListener("abrigo:navigation-preferences", refresh);
    return () => window.removeEventListener("abrigo:navigation-preferences", refresh);
  }, []);

  useEffect(() => {
    function keyboardShortcut(event) {
      if (
        event.key === "Escape"
        && pathname === ROUTES.SEARCH
        && location.state?.fromShortcut
      ) {
        event.preventDefault();
        navigate(location.state.fromPath || ROUTES.HOME);
        return;
      }
      if (!(event.ctrlKey || event.metaKey)
        || event.key.toLocaleLowerCase() !== "k") return;
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable
        || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      )) return;
      event.preventDefault();
      if (pathname !== ROUTES.SEARCH) {
        navigate(ROUTES.SEARCH, {
          state: { fromShortcut: true, fromPath: pathname },
        });
      }
    }
    window.addEventListener("keydown", keyboardShortcut);
    return () => window.removeEventListener("keydown", keyboardShortcut);
  }, [location.state, navigate, pathname]);

  const grupos = [
    {
      nome: "Principal",
      itens: [
        { nome: "Lar", rota: ROUTES.HOME, icone: <FaHome /> },
        { id: "moment", nome: "Momento do Dia", rota: ROUTES.MOMENT, icone: <FaHeart /> },
        { id: "pause", nome: "Só ficar", rota: ROUTES.PAUSE, icone: <FaMoon /> },
        { id: "diary", nome: "Reflexões", rota: ROUTES.DIARY, icone: <FaBookOpen /> },
        { id: "letters", nome: "Cartas", rota: ROUTES.LETTERS, icone: <FaEnvelope /> },
        { id: "favorites", nome: "Coisas que fazem bem", rota: ROUTES.FAVORITES, icone: <FaHeart /> },
      ],
    },
    {
      nome: "Seu espaço",
      itens: [
        { id: "habits", nome: "Pequenos Cuidados", rota: ROUTES.HABITS, icone: <FaLeaf /> },
        { id: "goals", nome: "Intenções", rota: ROUTES.GOALS, icone: <FaHeart /> },
        { id: "calendar", nome: "Meu Dia", rota: ROUTES.CALENDAR, icone: <FaCalendarAlt /> },
        { id: "capsules", nome: "Cápsulas", rota: ROUTES.CAPSULES, icone: <FaClock /> },
        { nome: "Meu Abrigo", rota: ROUTES.PERSONALIZATION, icone: <FaSlidersH /> },
        { id: "statistics", nome: "Retrospectiva", rota: ROUTES.STATISTICS, icone: <FaBookOpen /> },
      ],
    },
    {
      nome: "Mais",
      itens: [
        { id: "search", nome: "Pesquisa", rota: ROUTES.SEARCH, icone: <FaSearch /> },
        { id: "export", nome: "Exportar", rota: ROUTES.EXPORT, icone: <FaFileExport /> },
        { nome: "Novidades", rota: ROUTES.NEWS, icone: <FaLeaf /> },
        {
          nome: "Configurações",
          rota: ROUTES.SETTINGS,
          icone: <FaCog />,
        },
        { nome: "Sobre", rota: ROUTES.ABOUT, icone: <FaHeart /> },
      ],
    },
  ];
  const favoriteItems = navigationPreferences.favorites.map((id) => {
    const destination = NAV_DESTINATIONS.find(([target]) => target === id);
    return destination && isNavigationItemVisible(id, navigationPreferences)
      ? { id, nome: destination[1], rota: destination[2] }
      : null;
  }).filter(Boolean);

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
          {!workspace.isPersonal && <small className="navbar-space-mode">
            {workspace.isDemo ? "Demonstração" : "Visitante"}
          </small>}
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
          {favoriteItems.length > 0 && <section className="menu-group menu-favorites">
            <h3>Favoritos</h3>
            {favoriteItems.map((item) => <Link
              key={item.id}
              to={item.rota}
              className={pathname === item.rota ? "ativo" : ""}
              onClick={fecharMenu}
            >
              <span className="icone"><FaHeart /></span>{item.nome}
            </Link>)}
          </section>}
          {grupos.map((grupo) => (
            <section className="menu-group" key={grupo.nome}>
              <h3>{grupo.nome}</h3>
              {grupo.itens
                .filter((item) => !item.id || isNavigationItemVisible(
                  item.id,
                  navigationPreferences
                ))
                .map((item) => {
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
