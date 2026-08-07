import "./Ceu.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSkyTheme } from "../../core/atmosphere/useSkyTheme";
import { getMoonMessage, resolveAtmosphereLevel } from "../../core/atmosphere/SkyThemeService";
import { useAtmospherePreferences } from "../../core/atmosphere/useAtmospherePreferences";
import { useMusic } from "../contexts/MusicContext";

export default function Ceu() {
  const sky = useSkyTheme();
  const atmosphere = useAtmospherePreferences();
  const music = useMusic();
  const { pathname } = useLocation();
  const skyRef = useRef(null);
  const messageTimerRef = useRef(0);
  const [activeStar, setActiveStar] = useState(null);
  const [moonMessage, setMoonMessage] = useState("");
  const [constellationOpen, setConstellationOpen] = useState(false);
  const atmosphereLevel = resolveAtmosphereLevel(pathname);
  const style = useMemo(() => ({
    "--sky-top": sky.palette.colors[0],
    "--sky-middle": sky.palette.colors[1],
    "--sky-bottom": sky.palette.colors[2],
    "--sky-glow": sky.palette.colors[3],
    "--moon-shadow": `${Math.round((1 - sky.lunar.illumination) * 72)}%`,
  }), [sky.lunar.illumination, sky.palette.colors]);
  useEffect(() => {
    document.documentElement.dataset.skyPeriod = sky.period;
    document.documentElement.dataset.colorMode = sky.colorMode;
  }, [sky.colorMode, sky.period]);

  useEffect(() => {
    const element = skyRef.current;
    if (!element || !sky.motion) return undefined;
    let frame = 0;
    let lastX = 0;
    let lastY = 0;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastX = 0;
      lastY = 0;
      element.style.setProperty("--sky-shift-x", "0px");
      element.style.setProperty("--sky-shift-y", "0px");
      element.style.setProperty("--sky-depth-x", "0px");
      element.style.setProperty("--sky-depth-y", "0px");
    };
    const move = (event) => {
      if (document.visibilityState === "hidden") return;
      const x = ((event.clientX / window.innerWidth) - .5) * 14;
      const y = ((event.clientY / window.innerHeight) - .5) * 10;
      if (Math.abs(x - lastX) < .35 && Math.abs(y - lastY) < .35) return;
      lastX = x;
      lastY = y;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        element.style.setProperty("--sky-shift-x", `${x.toFixed(2)}px`);
        element.style.setProperty("--sky-shift-y", `${y.toFixed(2)}px`);
        element.style.setProperty("--sky-depth-x", `${(-x * .35).toFixed(2)}px`);
        element.style.setProperty("--sky-depth-y", `${(-y * .35).toFixed(2)}px`);
      });
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") reset();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      reset();
    };
  }, [sky.motion]);

  useEffect(() => () => window.clearTimeout(messageTimerRef.current), []);

  const showTemporarily = (callback, reset, duration = 4200) => {
    window.clearTimeout(messageTimerRef.current);
    callback();
    messageTimerRef.current = window.setTimeout(reset, duration);
  };

  const interactWithMoon = () => showTemporarily(
    () => setMoonMessage(getMoonMessage(sky.now)), () => setMoonMessage(""), 5200
  );
  const interactive = atmosphere.preferences.interactiveSky;
  const showRareEvents = atmosphere.preferences.rareEvents && !atmosphere.preferences.silenceMode;

  return <div ref={skyRef} style={style} className={`ceu sky-${sky.period} sky-${sky.preferences.intensity} atmosphere-level-${atmosphereLevel} ${
    sky.preferences.showStars ? "has-stars" : ""} ${
    sky.preferences.showGlows ? "has-glows" : ""} ${
    sky.motion ? "has-motion" : "no-motion"} ${interactive ? "is-interactive" : ""} ${
    atmosphere.preferences.silenceMode ? "mode-silence" : ""} ${music.tocando ? "music-active" : ""}`}>
    <div className="ceu-atmosphere" aria-hidden="true" />
    <div className="ceu-celestial">
      <span className="ceu-sun" aria-hidden="true" />
      {interactive && ["madrugada", "noite", "entardecer"].includes(sky.period)
        ? <button type="button" className={`ceu-moon ${moonMessage ? "is-listening" : ""}`}
          onClick={interactWithMoon} aria-label="Ouvir uma mensagem da lua" />
        : <span className="ceu-moon" aria-hidden="true" />}
    </div>
    <div className="ceu-stars" aria-hidden="true">
      {sky.scene.stars.map((star) => <span key={star.id} className={activeStar === star.id ? "is-active" : ""}
        onPointerDown={interactive ? () => showTemporarily(
          () => setActiveStar(star.id), () => setActiveStar(null), 1100
        ) : undefined} style={{
        "--x": `${star.x}%`, "--y": `${star.y}%`, "--scale": star.scale,
        "--delay": `${star.delay}s`, "--duration": `${star.duration}s`,
      }} />)}
      {sky.scene.constellation && <span className={`ceu-constellation ${constellationOpen ? "is-open" : ""}`}
        onPointerDown={interactive ? () => showTemporarily(
          () => setConstellationOpen(true), () => setConstellationOpen(false), 3600
        ) : undefined} />}
      {showRareEvents && sky.scene.shootingStar && <span className="ceu-shooting-star" />}
      {showRareEvents && sky.scene.meteor && <span className="ceu-meteor" />}
    </div>
    <div className="ceu-clouds" aria-hidden="true">
      {sky.scene.clouds.map((cloud) => <span key={cloud.id} style={{
        "--x": `${cloud.x}%`, "--y": `${20 + cloud.y * .7}%`, "--scale": cloud.scale,
        "--delay": `-${cloud.delay}s`, "--duration": `${cloud.duration + 45}s`,
      }} />)}
    </div>
    <div className="ceu-fauna" aria-hidden="true">
      {showRareEvents && sky.scene.birds.map((bird) => <span className="ceu-bird" key={bird.id} style={{
        "--y": `${18 + bird.y * .45}%`, "--delay": `${bird.delay + 5}s`,
        "--duration": `${bird.duration + 35}s`,
      }} />)}
      {showRareEvents && sky.scene.fireflies.map((firefly) => <span className="ceu-firefly" key={firefly.id} style={{
        "--x": `${firefly.x}%`, "--y": `${60 + firefly.y * .45}%`,
        "--delay": `${firefly.delay}s`, "--duration": `${firefly.duration}s`,
      }} />)}
    </div>
    {moonMessage && <p className="ceu-moon-message" role="status">{moonMessage}</p>}
  </div>;
}
