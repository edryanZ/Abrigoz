import "../shared/styles/App.css";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "../shared/feedback/ErrorBoundary";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./router/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}