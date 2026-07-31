import "./Ceu.css";
import { useEffect } from "react";
import { useSkyTheme } from "../../core/atmosphere/useSkyTheme";

export default function Ceu() {
  const sky = useSkyTheme();
  useEffect(() => {
    document.documentElement.dataset.skyPeriod = sky.period;
    document.documentElement.dataset.colorMode = sky.colorMode;
  }, [sky.colorMode, sky.period]);
  return <div className={`ceu sky-${sky.period} sky-${sky.preferences.intensity} ${
    sky.preferences.showStars ? "has-stars" : ""} ${
    sky.preferences.showGlows ? "has-glows" : ""} ${
    sky.motion ? "has-motion" : "no-motion"}`} aria-hidden="true">
    <div className="ceu-atmosphere" />
  </div>;
}
