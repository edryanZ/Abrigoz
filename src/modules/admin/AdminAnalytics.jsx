import "./AdminAnalytics.css";

import { useCallback, useRef, useState } from "react";

import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

const PRIVATE_COUNT = "less_than_5";

function displayCount(value) {
  return value === PRIVATE_COUNT ? "menos de 5" : new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function dateRange(days) {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - Number(days) + 1);
  const localDate = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  return { start: localDate(start), end: localDate(end) };
}

function Breakdown({ title, items, label = (name) => name }) {
  return (
    <GlassCard>
      <h2>{title}</h2>
      {items?.length ? <ol className="admin-analytics__ranking">
        {items.map((item) => <li key={item.name}>
          <span>{label(item.name)}</span><strong>{displayCount(item.count)}</strong>
        </li>)}
      </ol> : <p className="admin-analytics__empty">Ainda não há dados neste período.</p>}
    </GlassCard>
  );
}

export default function AdminAnalytics() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [range, setRange] = useState("7");
  const controllerRef = useRef(null);

  const load = useCallback(async (event) => {
    event?.preventDefault();
    if (!token || status === "loading") return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    setStatus("loading");
    try {
      const response = await fetch("/api/admin-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dateRange(range)),
        signal: controller.signal,
      });
      if (response.status === 401) {
        setData(null);
        setStatus("denied");
        return;
      }
      if (!response.ok) throw new Error("unavailable");
      const result = await response.json();
      setData(result);
      setStatus(result.daily?.length ? "success" : "empty");
    } catch {
      if (!controller.signal.aborted) {
        setData(null);
        setStatus("unavailable");
      }
    } finally {
      window.clearTimeout(timeout);
      setToken("");
    }
  }, [range, status, token]);

  const statusMessage = {
    denied: "A credencial informada não permite abrir este painel.",
    unavailable: "O painel está indisponível agora. Tente novamente mais tarde.",
    empty: "A consulta funcionou, mas ainda não há atividade neste período.",
  }[status];

  return (
    <Container>
      <div className="admin-analytics">
        <header>
          <p className="admin-analytics__eyebrow">Área administrativa</p>
          <h1>Atividade agregada do Abrigo</h1>
          <p>Os números representam sessões anônimas estimadas. Uma mesma pessoa pode aparecer em mais de uma sessão.</p>
        </header>
        <GlassCard>
          <form onSubmit={load}>
            <label htmlFor="admin-analytics-token">Credencial administrativa</label>
            <input id="admin-analytics-token" type="password" required autoComplete="off"
              value={token} disabled={status === "loading"}
              onChange={(event) => setToken(event.target.value)} />
            <label htmlFor="admin-analytics-range">Período</label>
            <select id="admin-analytics-range" value={range} disabled={status === "loading"}
              onChange={(event) => setRange(event.target.value)}>
              <option value="1">Hoje</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
            <button type="submit" disabled={status === "loading" || !token}>
              {status === "loading" ? "Consultando…" : data ? "Atualizar consulta" : "Consultar agregados"}
            </button>
          </form>
          {statusMessage && <p className="admin-analytics__message" role="status">{statusMessage}</p>}
        </GlassCard>

        {data && <>
          <section className="admin-analytics__summary" aria-label="Resumo da atividade">
            <GlassCard><strong>{displayCount(data.online_sessions)}</strong><span>Sessões online agora</span></GlassCard>
            <GlassCard><strong>{displayCount(data.summary?.estimated_sessions)}</strong><span>Sessões estimadas</span></GlassCard>
            <GlassCard><strong>{displayCount(data.summary?.page_views)}</strong><span>Páginas vistas</span></GlassCard>
            <GlassCard><strong>{displayCount(data.summary?.technical_errors)}</strong><span>Erros técnicos seguros</span></GlassCard>
          </section>

          <section className="admin-analytics__details" aria-label="Detalhes agregados">
            <Breakdown title="Páginas mais visitadas" items={data.popular_pages} />
            <Breakdown title="Dispositivos" items={data.devices} />
            <Breakdown title="Versões do aplicativo" items={data.app_versions} />
            <Breakdown title="Forma de uso" items={data.execution_modes}
              label={(name) => name === "pwa" ? "Aplicativo instalado" : "Navegador"} />
            <Breakdown title="Horários com mais atividade" items={data.peak_hours}
              label={(name) => `${String(name).padStart(2, "0")}:00`} />
          </section>

          <GlassCard>
            <h2>Atividade diária</h2>
            <div className="admin-analytics__table-wrap">
              <table>
                <thead><tr><th>Dia</th><th>Sessões</th><th>Páginas</th><th>Erros</th></tr></thead>
                <tbody>{data.daily.map((day) => <tr key={day.date}>
                  <td>{new Date(`${day.date}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                  <td>{displayCount(day.estimated_sessions)}</td>
                  <td>{displayCount(day.page_views)}</td>
                  <td>{displayCount(day.technical_errors)}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </GlassCard>
          <p className="admin-analytics__updated">
            Atualizado em {new Date(data.updated_at).toLocaleString("pt-BR")}
          </p>
        </>}
      </div>
    </Container>
  );
}
