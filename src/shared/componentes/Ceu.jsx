import "./Ceu.css";

import { useEffect, useMemo, useState } from "react";

import { getPeriod } from "../../core/utils/timePeriod";

export default function Ceu() {
  const [shootingStars, setShootingStars] = useState([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

 const periodo = useMemo(() => getPeriod(), []);

  const estrelasPequenas = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 8,
        duration: Math.random() * 4 + 3,
      })),
    []
  );

  const estrelasGrandes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 2,
        delay: Math.random() * 6,
        duration: Math.random() * 5 + 4,
      })),
    []
  );

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
          {estrelasPequenas.map((e) => (
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
          {estrelasGrandes.map((e) => (
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