import "../shared/styles/App.css";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "../shared/feedback/ErrorBoundary";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./router/AppRoutes";
import AnalyticsTracker from "../core/analytics/AnalyticsTracker";
import Ceu from "../shared/componentes/Ceu";
import OfflineStatus from "../shared/componentes/OfflineStatus";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <Ceu />
          <AnalyticsTracker />
          <OfflineStatus />
          <AppRoutes />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
