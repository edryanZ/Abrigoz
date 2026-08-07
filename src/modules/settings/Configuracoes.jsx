import "./Configuracoes.css";
import {
  FaAccessibleIcon, FaChartBar, FaCog, FaInfoCircle, FaKey,
  FaMusic, FaPalette, FaShieldAlt, FaTrashAlt, FaUser,
} from "react-icons/fa";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useUser } from "../../shared/contexts/UserContext";
import { useMusic } from "../../shared/contexts/MusicContext";
import { storage } from "../../core/storage/storage";
import SyncSettings from "./components/SyncSettings";
import PrivacyToggle from "../../shared/componentes/PrivacyToggle";
import AnalyticsSettings from "./components/AnalyticsSettings";
import { APP } from "../../core/constants/app";
import { useState } from "react";
import {
  clearLegacyAssistantHistory,
  hasLegacyAssistantHistory,
} from "../../core/privacy/LegacyAssistantDataService";
import {
  loadSkyPreferences, restoreSkyPreferences, saveSkyPreferences,
} from "../../core/atmosphere/SkyThemePreferencesService";
import {
  previewSky, stopSkyPreview,
} from "../../core/atmosphere/useSkyTheme";
import SharingSettings from "./components/SharingSettings";
import OfflineSettings from "./components/OfflineSettings";
import ExportSettings from "./components/ExportSettings";

const SECTIONS = [
  ["ceu","Céu e atmosfera"],
  ["compartilhamento","Compartilhamento"],
  ["offline","Offline e armazenamento"],
  ["exportacao","Exportação"],
  ["perfil","Perfil"],["aparencia","Aparência"],["musica","Música e som"],
  ["privacidade","Privacidade"],
  ["dados","Dados e backup"],["sincronizacao","Sincronização"],["chave","Chave do Abrigo"],
  ["metricas","Métricas anônimas"],["acessibilidade","Acessibilidade"],
  ["aplicativo","Informações do aplicativo"],["cuidado","Área de cuidado"],
];

function SettingCard({ id, icon, title, children, danger = false }) {
  return <GlassCard id={id} className={`config-card ${danger ? "is-danger" : ""}`}>
    <h2>{icon}{title}</h2>{children}
  </GlassCard>;
}

export default function Configuracoes() {
  const { greeting } = useTheme();
  const { name, updateUser, clearUser } = useUser();
  const music = useMusic();
  const [sky, setSky] = useState(loadSkyPreferences);
  const [hasLegacyAssistantData, setHasLegacyAssistantData] = useState(
    hasLegacyAssistantHistory
  );

  const changeName = () => {
    const value = prompt("Como você gostaria de ser chamado?", name);
    if (value?.trim()) updateUser({ name: value.trim() });
  };
  const reset = () => {
    if (!window.confirm("Deseja realmente apagar os dados locais do Abrigo?")) return;
    clearUser();
    storage.removeMany(["abrigo_streak","abrigo_statistics","abrigo_moods","abrigo_achievements"]);
    window.location.replace("/");
  };
  const updateSky = (changes) => setSky(saveSkyPreferences(changes));
  const clearLegacyAssistantData = () => {
    if (!window.confirm(
      "Apagar somente o histórico local deixado pelo antigo Assistente? Os outros dados do Abrigo serão preservados."
    )) return;
    if (clearLegacyAssistantHistory()) setHasLegacyAssistantData(false);
  };

  return <><Navbar /><Container><div className="configuracoes-page">
    <PageHeader greeting={greeting} title="Configurações"
      subtitle="Deixe o Abrigo confortável para o seu jeito de usar." />
    <div className="settings-shell">
      <nav className="settings-nav" aria-label="Seções das configurações">
        {SECTIONS.map(([id, label], index) => <a href={`#${id}`} key={id}>
          <span>{index + 1}</span>{label}</a>)}
      </nav>
      <div className="settings-content">
        <SettingCard id="ceu" icon={<FaPalette />} title="Céu e atmosfera">
          <p>O fundo acompanha o horário local sem recarregar páginas ou interromper músicas.</p>
          {[
            ["automatic","Céu automático conforme o horário"],
            ["useDeviceTime","Usar horário do dispositivo"],
            ["showStars","Mostrar estrelas"],
            ["showGlows","Mostrar brilhos"],
            ["allowAnimations","Permitir animações suaves"],
            ["reduceEffects","Reduzir efeitos visuais"],
            ["staticBackground","Usar fundo estático"],
          ].map(([key, label]) => <label className="config-switch" key={key}><span>{label}</span>
            <input type="checkbox" checked={sky[key]}
              onChange={(event) => updateSky({ [key]: event.target.checked })} /></label>)}
          <label>Intensidade do fundo<select value={sky.intensity}
            onChange={(event) => updateSky({ intensity: event.target.value })}>
            <option value="soft">Suave</option><option value="standard">Padrão</option>
            <option value="strong">Marcante</option></select></label>
          <label>Tema<select value={sky.colorMode}
            onChange={(event) => updateSky({ colorMode: event.target.value })}>
            <option value="system">Seguir sistema</option><option value="light">Claro</option>
            <option value="dark">Escuro</option></select></label>
          <div className="config-actions">
            {["madrugada","amanhecer","manha","tarde","entardecer","noite"].map((period) =>
              <button className="config-button" key={period}
                onClick={() => previewSky(period)}>Pré-visualizar {period}</button>)}
            <button className="config-button" onClick={stopSkyPreview}>Voltar ao horário real</button>
            <button className="config-button" onClick={() => setSky(restoreSkyPreferences())}>
              Restaurar padrão</button>
          </div>
        </SettingCard>
        <SettingCard id="compartilhamento" icon={<FaShieldAlt />} title="Compartilhamento">
          <SharingSettings />
        </SettingCard>
        <SettingCard id="offline" icon={<FaCog />} title="Offline e armazenamento">
          <OfflineSettings />
        </SettingCard>
        <SettingCard id="exportacao" icon={<FaInfoCircle />} title="Exportação">
          <ExportSettings />
        </SettingCard>
        <SettingCard id="perfil" icon={<FaUser />} title="Perfil">
          <p><strong>Nome:</strong> {name || "Visitante"}</p>
          <button className="config-button" onClick={changeName}>Alterar nome</button>
        </SettingCard>
        <SettingCard id="aparencia" icon={<FaPalette />} title="Aparência">
          <p>O tema claro ou escuro acompanha o período do dia e mantém o contraste do Abrigo.</p>
        </SettingCard>
        <SettingCard id="musica" icon={<FaMusic />} title="Música e som">
          <label className="config-switch"><span>Ativar player de música</span>
            <input type="checkbox" checked={music.preferences.enabled}
              onChange={(event) => music.updatePreferences({ enabled: event.target.checked })} /></label>
          <label>Volume padrão
            <input type="range" min="0" max="1" step=".05" value={music.volume}
              onChange={(event) => music.setVolume(Number(event.target.value))} /></label>
          <label className="config-switch"><span>Mostrar mini-player</span>
            <input type="checkbox" checked={music.preferences.miniPlayer}
              onChange={(event) => music.updatePreferences({ miniPlayer: event.target.checked })} /></label>
          <label>Repetição padrão
            <select value={music.preferences.repeat}
              onChange={(event) => music.updatePreferences({ repeat: event.target.value })}>
              <option value="none">Não repetir</option><option value="track">Repetir faixa</option>
              <option value="list">Repetir lista</option>
            </select></label>
        </SettingCard>
        <SettingCard id="privacidade" icon={<FaShieldAlt />} title="Privacidade">
          <p>Oculta rapidamente textos pessoais. Não substitui o bloqueio do dispositivo.</p>
          <PrivacyToggle />
          {hasLegacyAssistantData && <div className="legacy-assistant-data">
            <h3>Dados antigos do Assistente</h3>
            <p>Versões antigas do Abrigo podiam guardar um histórico local do antigo Assistente. Esse conteúdo não é mais usado pela experiência atual.</p>
            <button className="config-button danger" type="button"
              onClick={clearLegacyAssistantData}>Apagar dados antigos do Assistente</button>
          </div>}
        </SettingCard>
        <SettingCard id="dados" icon={<FaCog />} title="Dados e backup">
          <p>Backups locais e restauração permanecem dentro do painel seguro abaixo.</p>
        </SettingCard>
        <SettingCard id="sincronizacao" icon={<FaCog />} title="Sincronização">
          <SyncSettings />
        </SettingCard>
        <SettingCard id="chave" icon={<FaKey />} title="Chave do Abrigo">
          <p>A criação, recuperação e troca da chave são realizadas no painel de sincronização, sem exibir o hash.</p>
          <a className="config-link" href="#sincronizacao">Ir para sincronização</a>
        </SettingCard>
        <SettingCard id="metricas" icon={<FaChartBar />} title="Métricas anônimas">
          <AnalyticsSettings />
        </SettingCard>
        <SettingCard id="acessibilidade" icon={<FaAccessibleIcon />} title="Acessibilidade">
          <p>O Abrigo respeita redução de movimento, navegação por teclado e ajustes do seu navegador.</p>
        </SettingCard>
        <SettingCard id="aplicativo" icon={<FaInfoCircle />} title="Informações do aplicativo">
          <p><strong>{APP.NAME} — criado por {APP.AUTHOR}</strong></p>
          <p>Versão {APP.VERSION}</p>
        </SettingCard>
        <SettingCard id="cuidado" icon={<FaTrashAlt />} title="Área de cuidado" danger>
          <p>Redefinir remove dados locais deste navegador. Essa ação exige confirmação.</p>
          <button className="config-button danger" onClick={reset}>Redefinir Abrigo</button>
        </SettingCard>
      </div>
    </div>
  </div></Container></>;
}
