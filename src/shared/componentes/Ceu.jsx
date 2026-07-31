import "./Ceu.css";
import { useEffect, useRef } from "react";
import { useSkyTheme } from "../../core/atmosphere/useSkyTheme";

export default function Ceu() {
  const sky = useSkyTheme();
  const skyRef = useRef(null);
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

  return <div ref={skyRef} className={`ceu sky-${sky.period} sky-${sky.preferences.intensity} ${
    sky.preferences.showStars ? "has-stars" : ""} ${
    sky.preferences.showGlows ? "has-glows" : ""} ${
    sky.motion ? "has-motion" : "no-motion"}`} aria-hidden="true">
    <div className="ceu-atmosphere" />
  </div>;
}
