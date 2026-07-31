import "./ExportCenter.css";
import { useMemo, useState } from "react";
import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import PageHeader from "../../shared/componentes/PageHeader";
import { useTheme } from "../../shared/contexts/ThemeContext";
import {
  collectExportData, EXPORT_MODULES, removeExportFields,
} from "../../core/export/ExportDataService";
import { protectExport } from "../../core/export/ExportCryptoService";
import {
  toCalendar, toCsv, toHtml, toMarkdown,
} from "../../core/export/ExportFormatService";
import {
  downloadExport, safeFilename,
} from "../../core/export/ExportDownloadService";
import { createSingleFileZip } from "../../core/export/ZipStoreService";
import {
  loadExportPreferences, saveExportPreferences,
} from "../../core/export/ExportPreferencesService";

export default function ExportCenter() {
  const { greeting } = useTheme();
  const [preferences, setPreferences] = useState(loadExportPreferences);
  const [modules, setModules] = useState([]);
  const [itemIds, setItemIds] = useState({});
  const [options, setOptions] = useState({
    hideDates: false, hideMood: false, hideTags: false, hideNames: false,
  });
  const [protect, setProtect] = useState(preferences.protectByDefault);
  const [passphrase, setPassphrase] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState("");
  const source = useMemo(() => collectExportData(modules, {
    period: preferences.period, itemIdsByModule: itemIds,
  }), [itemIds, modules, preferences.period]);
  const document = useMemo(() => removeExportFields(source, options), [options, source]);
  const updatePreferences = (changes) => {
    const next = saveExportPreferences(changes); setPreferences(next);
  };
  const toggleModule = (id, checked) => {
    setModules((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id));
    if (checked) {
      const items = collectExportData([id]).modules[id];
      if (Array.isArray(items)) setItemIds((current) => ({
        ...current, [id]: items.filter((item) => item?.id != null).map((item) => String(item.id)),
      }));
    }
  };
  const generate = async () => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      if (protect) {
        const protectedDocument = await protectExport(document, passphrase);
        downloadExport(JSON.stringify(protectedDocument, null, 2),
          safeFilename(`abrigo-export-protegido-${date}`, "json"), "application/json");
      } else if (preferences.format === "csv") {
        downloadExport(toCsv(document), safeFilename(`abrigo-export-${date}`, "csv"), "text/csv");
      } else if (preferences.format === "markdown") {
        downloadExport(toMarkdown(document), safeFilename(`abrigo-export-${date}`, "md"), "text/markdown");
      } else if (preferences.format === "html" || preferences.format === "print") {
        const html = toHtml(document);
        if (preferences.format === "print") {
          const popup = window.open("", "_blank", "noopener,noreferrer");
          if (!popup) throw new Error("Permita a janela de impressão no navegador.");
          popup.document.write(html); popup.document.close(); popup.print();
        } else downloadExport(html, safeFilename(`abrigo-relatorio-${date}`, "html"), "text/html");
      } else if (preferences.format === "calendar") {
        downloadExport(toCalendar(document), safeFilename(`abrigo-calendario-${date}`, "ics"), "text/calendar");
      } else if (preferences.format === "zip") {
        const zip = createSingleFileZip("abrigo-export.json", JSON.stringify(document, null, 2));
        downloadExport(zip, safeFilename(`abrigo-export-${date}`, "zip"), "application/zip");
      } else {
        downloadExport(JSON.stringify(document, null, 2),
          safeFilename(`abrigo-export-${date}`, "json"), "application/json");
      }
      setMessage("Exportação preparada no seu dispositivo."); setReviewing(false);
    } catch (error) { setMessage(error.message); }
  };

  return <><Ceu /><Navbar /><Container><main className="export-page">
    <PageHeader greeting={greeting} title="Exportar"
      subtitle="Escolha exatamente o que deseja levar com você." />
    <GlassCard className="export-card">
      <fieldset><legend>Módulos</legend><div className="export-grid">
        {Object.entries(EXPORT_MODULES).map(([id, definition]) => <label key={id}>
          <input type="checkbox" checked={modules.includes(id)}
            onChange={(event) => toggleModule(id, event.target.checked)} />{definition.label}</label>)}
      </div></fieldset>
      {modules.map((id) => {
        const items = collectExportData([id]).modules[id];
        if (!Array.isArray(items) || !items.some((item) => item?.id != null)) return null;
        return <details key={id}><summary>Selecionar itens de {EXPORT_MODULES[id].label}</summary>
          <div className="export-items">{items.slice(0, 100).filter((item) => item?.id != null).map((item) =>
            <label key={item.id}><input type="checkbox" checked={itemIds[id]?.includes(String(item.id)) ?? true}
              onChange={(event) => setItemIds((current) => ({
                ...current, [id]: event.target.checked
                  ? [...new Set([...(current[id] ?? []), String(item.id)])]
                  : (current[id] ?? []).filter((value) => value !== String(item.id)),
              }))} />{String(item.title ?? item.titulo ?? item.name ?? item.nome ?? item.id).slice(0, 100)}</label>)}</div>
        </details>;
      })}
      <div className="export-options"><label>Período<select value={preferences.period}
        onChange={(event) => updatePreferences({ period: event.target.value })}>
        <option value="all">Todo o período</option><option value="week">Últimos 7 dias</option>
        <option value="month">Últimos 30 dias</option><option value="year">Último ano</option></select></label>
        <label>Formato<select value={preferences.format}
          onChange={(event) => updatePreferences({ format: event.target.value })}>
          <option value="json">JSON</option><option value="csv">CSV</option>
          <option value="markdown">Markdown</option><option value="html">HTML / relatório</option>
          <option value="print">Impressão / salvar como PDF</option><option value="calendar">Calendário (.ics)</option>
          <option value="zip">ZIP</option></select></label></div>
      <fieldset><legend>Privacidade</legend><div className="export-grid">
        {[["hideDates","Ocultar datas"],["hideMood","Ocultar humor"],["hideTags","Ocultar tags"],
          ["hideNames","Ocultar nomes"]].map(([key, label]) => <label key={key}><input type="checkbox"
            checked={options[key]} onChange={(event) => setOptions((current) => ({
              ...current, [key]: event.target.checked,
            }))} />{label}</label>)}
        <label><input type="checkbox" checked={protect}
          onChange={(event) => setProtect(event.target.checked)} />Proteger com senha</label></div></fieldset>
      {protect && <label>Senha de proteção<input type="password" value={passphrase}
        onChange={(event) => setPassphrase(event.target.value)} minLength="8" /></label>}
      <button disabled={!modules.length} onClick={() => setReviewing(true)}>Revisar exportação</button>
      {message && <p role="status">{message}</p>}
    </GlassCard>
    {reviewing && <div className="export-review" role="dialog" aria-modal="true"
      aria-labelledby="export-review-title"><div><h2 id="export-review-title">Conteúdo incluído</h2>
        <p>{protect ? "O arquivo será protegido." : "O arquivo não terá proteção criptográfica."}</p>
        <textarea readOnly rows="16" value={JSON.stringify(document, null, 2)}
          aria-label="Prévia completa da exportação" />
        <div><button onClick={() => setReviewing(false)}>Cancelar</button>
          <button onClick={generate}>Confirmar e exportar</button></div></div></div>}
  </main></Container></>;
}
