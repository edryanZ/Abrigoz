import { useEffect, useState } from "react";
import {
  dismissInstallPrompt,
  requestInstall,
  subscribeInstallAvailability,
} from "../../core/offline/PWAInstallService.js";
import { useWorkspace } from "../contexts/WorkspaceContext.jsx";

export default function InstallSuggestion() {
  const workspace = useWorkspace();
  const [available, setAvailable] = useState(false);
  useEffect(() => subscribeInstallAvailability(setAvailable), []);
  if (!available || !workspace.isPersonal) return null;
  return <aside className="install-suggestion" aria-label="Instalar o Abrigo">
    <span>Quer deixar o Abrigo mais perto? Você pode instalá-lo neste dispositivo.</span>
    <div><button type="button" onClick={dismissInstallPrompt}>Agora não</button>
      <button type="button" onClick={() => void requestInstall()}>Instalar</button></div>
  </aside>;
}
