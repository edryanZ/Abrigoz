import "./AdminAnalytics.css";

import { useState } from "react";

import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

export default function AdminAnalytics() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [range, setRange] = useState("7");

  async function load(event) {
    event.preventDefault();
    setStatus("loading");
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - Number(range) + 1);
    try {
      const response = await fetch("/api/admin-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          start: start.toISOString().slice(0, 10),
          end: end.toISOString().slice(0, 10),
        }),
      });
      if (!response.ok) throw new Error("unavailable");
      const result = await response.json();
      setData(result.data);
      setStatus("success");
      setToken("");
    } catch {
      setData(null);
      setStatus("error");
    }
  }

  return (
    <><Container>
      <main className="admin-analytics">
        <h1>Atividade agregada do Abrigo</h1>
        <p>Os números são aproximados e não identificam pessoas. Um mesmo visitante pode abrir mais de uma sessão.</p>
        <GlassCard>
          <form onSubmit={load}>
            <label>Credencial administrativa
              <input type="password" required autoComplete="off" value={token}
                onChange={(event) => setToken(event.target.value)} /></label>
            <label>Período<select value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="1">Hoje</option><option value="7">7 dias</option>
              <option value="30">30 dias</option>
            </select></label>
            <button type="submit" disabled={status === "loading"}>Consultar agregados</button>
          </form>
          {status === "error" && <p role="alert">Painel indisponível ou acesso não autorizado.</p>}
        </GlassCard>
        {data && <section className="admin-analytics__summary">
          <GlassCard><strong>{data.online_sessions ?? 0}</strong><span>Sessões online agora</span></GlassCard>
          <GlassCard><strong>{data.daily?.reduce((sum, day) => sum + Number(day.sessions || 0), 0) ?? 0}</strong>
            <span>Acessos estimados</span></GlassCard>
          <GlassCard><strong>{data.daily?.reduce((sum, day) => sum + Number(day.page_views || 0), 0) ?? 0}</strong>
            <span>Visualizações de páginas</span></GlassCard>
        </section>}
      </main>
    </Container></>
  );
}
