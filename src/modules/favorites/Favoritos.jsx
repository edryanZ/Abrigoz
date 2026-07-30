import "./Favoritos.css";

import { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import { useTheme } from "../../shared/contexts/ThemeContext";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import FavoriteCard from "./components/FavoriteCard";
import FavoriteForm from "./components/FavoriteForm";
import useFavorites from "./hooks/useFavorites";
import { FAVORITE_TYPES } from "./services/favoritesService";

export default function Favoritos() {
  const { greeting } = useTheme();
  const favorites = useFavorites();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const close = () => {
    setEditing(null);
    setFormOpen(false);
  };

  return (
    <>
      <Ceu />
      <Navbar />
      <Container>
        <PageHeader
          greeting={`${greeting} ⭐`}
          title="Favoritos"
          subtitle="Guarde ideias, histórias e coisas que fazem bem."
        />
        <GlassCard className="organizer-toolbar" hover={false}>
          <label>
            <span>Buscar</span>
            <div className="organizer-search">
              <FaSearch />
              <input
                value={favorites.filters.query}
                onChange={(event) => favorites.setFilter("query", event.target.value)}
                placeholder="O que você procura?"
              />
            </div>
          </label>
          <label>
            <span>Tipo</span>
            <select
              value={favorites.filters.type}
              onChange={(event) => favorites.setFilter("type", event.target.value)}
            >
              <option value="all">Todos</option>
              {Object.entries(FAVORITE_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Tag</span>
            <input
              value={favorites.filters.tag}
              onChange={(event) => favorites.setFilter("tag", event.target.value)}
              placeholder="Ex.: viagem"
            />
          </label>
          <label>
            <span>Ordenar</span>
            <select
              value={favorites.filters.order}
              onChange={(event) => favorites.setFilter("order", event.target.value)}
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="alphabetical">A–Z</option>
            </select>
          </label>
          <button type="button" onClick={() => setFormOpen(true)}>
            <FaPlus /> Novo favorito
          </button>
        </GlassCard>

        {formOpen && (
          <GlassCard className="organizer-editor" hover={false}>
            <h2>{editing ? "Editar favorito" : "Novo favorito"}</h2>
            <FavoriteForm
              item={editing}
              onCancel={close}
              onSave={(item) => {
                favorites.save(item);
                close();
              }}
            />
          </GlassCard>
        )}

        <section className="favorite-grid" aria-live="polite">
          {favorites.items.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              onPin={favorites.togglePinned}
              onEdit={(favorite) => {
                setEditing(favorite);
                setFormOpen(true);
              }}
              onDelete={(favorite) => {
                if (window.confirm(`Excluir “${favorite.title}”?`)) {
                  favorites.remove(favorite.id);
                }
              }}
            />
          ))}
        </section>
        {!favorites.items.length && (
          <GlassCard className="organizer-empty" hover={false}>
            <span>⭐</span>
            <h2>Seu cantinho de favoritos está esperando</h2>
            <p>Adicione algo especial ou ajuste os filtros da busca.</p>
          </GlassCard>
        )}
      </Container>
    </>
  );
}
