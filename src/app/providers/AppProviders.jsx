import { ThemeProvider } from "../../shared/contexts/ThemeContext";
import { MusicProvider } from "../../shared/contexts/MusicContext";
import { UserProvider } from "../../shared/contexts/UserContext";
import { JourneyProvider } from "../../shared/contexts/JourneyContext";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <MusicProvider>
        <UserProvider>
          <JourneyProvider>
            {children}
          </JourneyProvider>
        </UserProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}