import "../shared/styles/App.css";
import { useCallback, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "../shared/feedback/ErrorBoundary";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./router/AppRoutes";
import AnalyticsTracker from "../core/analytics/AnalyticsTracker";
import Ceu from "../shared/componentes/Ceu";
import OfflineStatus from "../shared/componentes/OfflineStatus";
import AbrigoSplash from "../shared/componentes/AbrigoSplash";

export default function App() {
  const [ready, setReady] = useState(false);
  const finishSplash = useCallback(() => setReady(true), []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <Ceu />
          <AnalyticsTracker />
          <OfflineStatus />
          {!ready && <AbrigoSplash onComplete={finishSplash} />}
          {ready && <AppRoutes />}
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
