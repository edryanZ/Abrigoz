import { useState } from "react";

import {
  changeDevicePin,
  disableDevicePin,
  enableDevicePin,
  getPinConfiguration,
  requestDeviceLock,
  updateDevicePinAutoLock,
} from "../../../core/privacy/DevicePinService.js";
import { WORKSPACE_MODES } from "../../../core/privacy/WorkspaceModeService.js";
import { useWorkspace } from "../../../shared/contexts/WorkspaceContext.jsx";

export default function PrivacySpaceSettings() {
  const workspace = useWorkspace();
  const [config, setConfig] = useState(getPinConfiguration);
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [message, setMessage] = useState("");

  const runPinAction = async (action) => {
    setMessage("");
    try {
      await action();
      setCurrentPin(""); setNextPin("");
      setConfig(getPinConfiguration());
      setMessage("Configuração atualizada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o bloqueio.");
    }
  };

  const switchMode = (mode) => {
    if (mode === workspace.mode) return;
    if (!workspace.isPersonal && !window.confirm("Encerrar este espaço temporário? Os dados desta sessão serão descartados.")) return;
    workspace.changeMode(mode);
  };

  return <div className="privacy-space-settings">
    <h3>Espaço atual</h3>
    <p>{workspace.isPersonal
      ? "Abrigo Pessoal — seus dados normais deste dispositivo."
      : workspace.isVisitor
        ? "Visitante — espaço temporário e isolado. Ao encerrar, os dados são descartados."
        : "Demonstração — somente dados fictícios e exemplos locais."}</p>
    <div className="config-actions" role="group" aria-label="Escolher espaço do Abrigo">
      <button className="config-button" type="button" onClick={() => switchMode(WORKSPACE_MODES.PERSONAL)}>Pessoal</button>
      <button className="config-button" type="button" onClick={() => switchMode(WORKSPACE_MODES.VISITOR)}>Visitante</button>
      <button className="config-button" type="button" onClick={() => switchMode(WORKSPACE_MODES.DEMO)}>Demonstração</button>
    </div>
    {!workspace.isPersonal && <p><strong>Neste espaço:</strong> sincronização, backup remoto e métricas ficam desligados.</p>}

    {workspace.isPersonal && <>
      <h3>Bloqueio neste dispositivo</h3>
      <p>O PIN bloqueia o acesso pela interface. Ele não criptografa todos os dados locais.</p>
      {!config.enabled ? <>
        <label>Novo PIN<input type="password" inputMode="numeric" autoComplete="new-password"
          value={nextPin} onChange={(event) => setNextPin(event.target.value.replace(/\D/g, "").slice(0, 12))} /></label>
        <button className="config-button" type="button" onClick={() => runPinAction(() => enableDevicePin(nextPin))}>Ativar PIN</button>
      </> : <>
        <label>Bloqueio automático<select value={config.autoLock} onChange={(event) => {
          const next = updateDevicePinAutoLock(event.target.value, config.timeoutMinutes); setConfig(next);
        }}><option value="never">Nunca durante o uso</option><option value="minutes">Após alguns minutos</option><option value="reopen">Ao reabrir o Abrigo</option></select></label>
        {config.autoLock === "minutes" && <label>Minutos<input type="number" min="1" max="120" value={config.timeoutMinutes}
          onChange={(event) => setConfig(updateDevicePinAutoLock("minutes", event.target.value))} /></label>}
        <button className="config-button" type="button" onClick={requestDeviceLock}>Bloquear agora</button>
        <label>PIN atual<input type="password" inputMode="numeric" autoComplete="current-password" value={currentPin}
          onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, "").slice(0, 12))} /></label>
        <label>Novo PIN<input type="password" inputMode="numeric" autoComplete="new-password" value={nextPin}
          onChange={(event) => setNextPin(event.target.value.replace(/\D/g, "").slice(0, 12))} /></label>
        <div className="config-actions">
          <button className="config-button" type="button" onClick={() => runPinAction(() => changeDevicePin(currentPin, nextPin))}>Trocar PIN</button>
          <button className="config-button danger" type="button" onClick={() => runPinAction(() => disableDevicePin(currentPin))}>Desativar PIN</button>
        </div>
      </>}
      {message && <p role="status">{message}</p>}
    </>}
  </div>;
}
