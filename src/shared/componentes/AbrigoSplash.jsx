import "./AbrigoSplash.css";

import { useEffect } from "react";
import { getSplashPhrase } from "../../core/atmosphere/SkyThemeService";

const SPLASH_DURATION_MS = 1200;

export default function AbrigoSplash({ onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return <div className="abrigo-splash" role="status" aria-label="Abrigo iniciando">
    <div className="abrigo-splash__content">
      <img src="/branding/favicon-192.png" alt="" aria-hidden="true" />
      <strong>Abrigo</strong>
      <p>{getSplashPhrase()}</p>
    </div>
  </div>;
}

export { SPLASH_DURATION_MS };
