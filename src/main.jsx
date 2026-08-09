import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import {
  announcePWAUpdate, configurePWAUpdate,
} from "./core/offline/PWAUpdateService";

import App from "./app/App";
import "./index.css";
import { captureInstallPrompt, markInstalled } from "./core/offline/PWAInstallService";

window.addEventListener("beforeinstallprompt", captureInstallPrompt);
window.addEventListener("appinstalled", markInstalled);

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: announcePWAUpdate,
});
configurePWAUpdate(updateSW);

createRoot(document.getElementById("root")).render(
  <App />
);
