import { ThemeProvider } from "../../shared/contexts/ThemeContext";
import { MusicProvider } from "../../shared/contexts/MusicContext";
import { UserProvider } from "../../shared/contexts/UserContext";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <MusicProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}
