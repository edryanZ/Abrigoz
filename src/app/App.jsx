import "../shared/styles/App.css";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "../shared/feedback/ErrorBoundary";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./router/AppRoutes";
import AnalyticsTracker from "../core/analytics/AnalyticsTracker";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AnalyticsTracker />
          <AppRoutes />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
