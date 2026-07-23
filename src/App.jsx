import "./App.css";

import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { MusicProvider } from "./context/MusicContext";
import { UserProvider } from "./context/UserContext";

import ErrorBoundary from "./components/common/ErrorBoundary";

import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MusicProvider>
          <UserProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </UserProvider>
        </MusicProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}