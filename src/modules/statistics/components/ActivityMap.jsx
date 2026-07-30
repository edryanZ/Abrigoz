import { useMemo, useState } from "react";

import GlassCard from "../../../shared/ui/GlassCard";
import { localDateKey, shiftLocalDate } from "../../../core/intelligence/localDates";

const MODULES = {
  all: "Todos",
  diary: "Diário",
  calendar: "Calendário",
  favorites: "Favoritos",
  goals: "Metas",
  habits: "Hábitos",
};

export default function ActivityMap({ moments, year, setYear, module, setModule }) {
  const [selected, setSelected] = useState(null);
  const map = useMemo(() => new Map(moments.map((item) => [item.date, item])), [moments]);
  const days = useMemo(() => {
    const result = [];
    for (let date = new Date(year, 0, 1); date.getFullYear() === year;
      date = shiftLocalDate(date, 1)) result.push(localDateKey(date));
    return result;
  }, [year]);

  return (
    <GlassCard className="moment-map">
      <div className="moment-map__header">
        <div><h2>Mapa de momentos</h2><p>Intensidade de atividades, sem pontuação ou julgamento.</p></div>
        <div className="moment-map__filters">
          <label>Ano<input type="number" min="2000" max="2100" value={year}
            onChange={(event) => setYear(Number(event.target.value))} /></label>
          <label>Módulo<select value={module} onChange={(event) => setModule(event.target.value)}>
            {Object.entries(MODULES).map(([value, label]) =>
              <option key={value} value={value}>{label}</option>)}
          </select></label>
        </div>
      </div>
      <div className="moment-map__grid" role="grid" aria-label={`Atividades em ${year}`}>
        {days.map((date) => {
          const item = map.get(date);
          return <button key={date} type="button" role="gridcell"
            className={`moment-map__day level-${item?.intensity ?? 0}`}
            aria-label={`${date}: ${item?.count ?? 0} atividade(s)`}
            onClick={() => setSelected(item ?? { date, count: 0, modules: [] })} />;
        })}
      </div>
      <div className="moment-map__legend" aria-label="Legenda de intensidade">
        <span>Sem registro</span>{[0, 1, 2, 3, 4].map((level) =>
          <i key={level} className={`level-${level}`} aria-hidden="true" />)}<span>Mais momentos</span>
      </div>
      {selected && <p className="moment-map__detail" aria-live="polite">
        {selected.date}: {selected.count || "nenhuma"} atividade(s)
        {selected.modules?.length ? ` em ${selected.modules.map((item) => MODULES[item]).join(", ")}` : ""}.
      </p>}
    </GlassCard>
  );
}
