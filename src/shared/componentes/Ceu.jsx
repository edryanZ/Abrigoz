import "./Ceu.css";

import { useEffect, useMemo, useState } from "react";

import { getPeriod } from "../../core/utils/timePeriod";

function createStars(length, size, delay, duration) {
  return Array.from({ length }, (_, id) => ({
    id,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * size + 1,
    delay: Math.random() * delay,
    duration: Math.random() * duration + 3,
  }));
}

const SMALL_STARS = createStars(120, 2, 8, 4);
const LARGE_STARS = createStars(40, 3, 6, 5);

export default function Ceu() {
  const [shootingStars, setShootingStars] = useState([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const periodo = useMemo(() => getPeriod(), []);

  useEffect(() => {
    function mover(e) {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      setMouse({ x, y });
    }

    window.addEventListener("mousemove", mover);

    return () => window.removeEventListener("mousemove", mover);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const id = Date.now();

      setShootingStars((old) => [
        ...old,
        {
          id,
          top: Math.random() * 45,
          left: Math.random() * 70,
        },
      ]);

      setTimeout(() => {
        setShootingStars((old) =>
          old.filter((s) => s.id !== id)
        );
      }, 1500);
    }, 12000 + Math.random() * 8000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className={`ceu ${periodo}`}>
      <div className="ceu-gradiente" />

      <div
        className="parallax"
        style={{
          transform: `translate(${mouse.x}px, ${mouse.y}px)`,
        }}
      >
        <div className="lua" />
        <div className="halo-lua" />

        <div className="nevoa nevoa1" />
        <div className="nevoa nevoa2" />

        <div className="estrelas pequenas">
          {SMALL_STARS.map((e) => (
            <span
              key={e.id}
              className="estrela"
              style={{
                top: `${e.top}%`,
                left: `${e.left}%`,
                width: e.size,
                height: e.size,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
              }}
            />
          ))}
        </div>

        <div className="estrelas grandes">
          {LARGE_STARS.map((e) => (
            <span
              key={e.id}
              className="estrela grande"
              style={{
                top: `${e.top}%`,
                left: `${e.left}%`,
                width: e.size,
                height: e.size,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
              }}
            />
          ))}
        </div>

        {shootingStars.map((s) => (
          <span
            key={s.id}
            className="estrela-cadente"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
