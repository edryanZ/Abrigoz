import "./App.css";

import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { MusicProvider } from "./context/MusicContext";
import { UserProvider } from "./context/UserContext";
import { JourneyProvider } from "./context/JourneyContext";

import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <MusicProvider>
            <UserProvider>
              <JourneyProvider>
                <AppRoutes />
              </JourneyProvider>
            </UserProvider>
          </MusicProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}