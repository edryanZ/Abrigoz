import "./Calendario.css";

import { useCallback, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";
import { useTheme } from "../../shared/contexts/ThemeContext";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import Section from "../../shared/ui/Section";
import CalendarioGrid from "./components/CalendarioGrid";
import EventList from "./components/EventList";
import ModalEvento from "./components/ModalEvento";
import useCalendarEvents from "./hooks/useCalendarEvents";
import { EVENT_CATEGORIES } from "./services/calendarService";
import { buildContentIndicatorMap } from "../../core/memory/MemoryService";
import { readLocalData } from "../../core/intelligence/LocalDataSource";
import { deleteSpecialDate, listSpecialDates, saveSpecialDate } from "../../core/memory/SpecialDatesService";

export default function Calendario() {
  const { greeting } = useTheme();
  const calendar = useCalendarEvents();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [specialDates, setSpecialDates] = useState(listSpecialDates);
  const [specialName, setSpecialName] = useState("");
  const [specialDescription, setSpecialDescription] = useState("");
  const contentIndicators = buildContentIndicatorMap(readLocalData());
  const selectedSpecialDates = specialDates.filter((item) => item.date === calendar.selectedDate);

  const closeForm = useCallback(() => {
    setEditing(null);
    setFormOpen(false);
  }, []);

  function handleDelete(event) {
    const recurring = event.recurrence !== "none";
    const message = recurring
      ? "Excluir apenas esta ocorrência? Escolha Cancelar para excluir a série inteira."
      : `Excluir o evento “${event.title}”?`;
    const occurrenceOnly = window.confirm(message);
    if (!recurring && !occurrenceOnly) return;
    if (recurring && !occurrenceOnly) {
      const seriesConfirmed = window.confirm(
        "Deseja realmente excluir toda a série?"
      );
      if (!seriesConfirmed) return;
    }
    calendar.deleteEvent(
      event.id,
      event.occurrenceDate,
      recurring && occurrenceOnly ? "occurrence" : "series"
    );
  }

  return (
    <>
      <Navbar />
      <Container>
        <PageHeader
          greeting={`${greeting} 📅`}
          title="Meu Dia"
          subtitle="Veja o que faz parte dos seus dias, sem transformar a rotina em cobrança."
        />
        <PrivacyNotice />
        <Section>
          <div className="calendar-layout">
            <GlassCard className="calendario-card" hover={false}>
              <CalendarioGrid
                month={calendar.month}
                selectedDate={calendar.selectedDate}
                occurrences={calendar.visibleOccurrences}
                onSelect={calendar.setSelectedDate}
                onChangeMonth={calendar.changeMonth}
                onToday={calendar.goToday}
                contentIndicators={contentIndicators}
              />
            </GlassCard>

            <GlassCard className="calendar-agenda" hover={false}>
              <header className="calendar-agenda-header">
                <div>
                  <span>O que faz parte deste dia</span>
                  <h2>{new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "long",
                  }).format(new Date(`${calendar.selectedDate}T12:00:00`))}</h2>
                </div>
                <button
                  type="button"
                  className="calendar-add"
                  onClick={() => setFormOpen(true)}
                >
                  <FaPlus /> Novo
                </button>
              </header>

              <div className="calendar-filters">
                <label>
                  <span>Buscar eventos</span>
                  <div className="calendar-search">
                    <FaSearch aria-hidden="true" />
                    <input
                      value={calendar.query}
                      onChange={(event) => calendar.setQuery(event.target.value)}
                      placeholder="Título, descrição ou local"
                    />
                  </div>
                </label>
                <label>
                  <span>Categoria</span>
                  <select
                    value={calendar.category}
                    onChange={(event) => calendar.setCategory(event.target.value)}
                  >
                    <option value="all">Todas</option>
                    {Object.entries(EVENT_CATEGORIES).map(([value, details]) => (
                      <option key={value} value={value}>{details.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <EventList
                events={calendar.selectedEvents}
                onEdit={(event) => {
                  setEditing(event);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
              <section className="calendar-special-dates" aria-labelledby="special-date-title">
                <h3 id="special-date-title">Data importante</h3>
                <p>Opcional. Você não precisa explicar o motivo.</p>
                {selectedSpecialDates.map((item) => <div className="special-date-item" key={item.id}>
                  <div><strong>{item.name || "Data importante"}</strong>{item.description && <p>{item.description}</p>}</div>
                  <button type="button" onClick={() => {
                    deleteSpecialDate(item.id); setSpecialDates(listSpecialDates());
                  }}>Remover</button>
                </div>)}
                <label>Nome opcional<input value={specialName} maxLength={100}
                  onChange={(event) => setSpecialName(event.target.value)} /></label>
                <label>Descrição opcional<textarea value={specialDescription} maxLength={300}
                  onChange={(event) => setSpecialDescription(event.target.value)} /></label>
                <button type="button" className="calendar-add" onClick={() => {
                  saveSpecialDate({ date: calendar.selectedDate, name: specialName, description: specialDescription });
                  setSpecialName(""); setSpecialDescription(""); setSpecialDates(listSpecialDates());
                }}>Guardar esta data</button>
              </section>
            </GlassCard>
          </div>
        </Section>
      </Container>
      {formOpen && (
        <ModalEvento
          event={editing}
          selectedDate={calendar.selectedDate}
          onClose={closeForm}
          onSave={(event) => {
            calendar.saveEvent(event);
            closeForm();
          }}
        />
      )}
    </>
  );
}
