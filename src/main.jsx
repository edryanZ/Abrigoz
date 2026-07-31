import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import {
  announcePWAUpdate, configurePWAUpdate,
} from "./core/offline/PWAUpdateService";

import App from "./app/App";
import "./index.css";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: announcePWAUpdate,
});
configurePWAUpdate(updateSW);

createRoot(document.getElementById("root")).render(
  <App />
);
