import "./Contador.css";
import { useEffect, useMemo, useState } from "react";

export default function Contador() {
  // Data em que o Abrigo foi publicado
  const dataPublicacao = new Date(2026, 6, 17);

  function calcularTempo() {
    const agora = new Date();

    const diferenca = agora - dataPublicacao;

    return {
      dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
      horas: Math.floor((diferenca / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((diferenca / (1000 * 60)) % 60),
      segundos: Math.floor((diferenca / 1000) % 60),
    };
  }

  const [tempo, setTempo] = useState(calcularTempo);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(calcularTempo());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const itens = useMemo(
    () => [
      {
        valor: tempo.dias,
        texto: "Dias",
      },
      {
        valor: tempo.horas,
        texto: "Horas",
      },
      {
        valor: tempo.minutos,
        texto: "Minutos",
      },
      {
        valor: tempo.segundos,
        texto: "Segundos",
      },
    ],
    [tempo]
  );

  return (
    <section
      className="contador"
      aria-labelledby="contador-titulo"
    >
      <span className="contador-tag">
        🚀 Abrigo
      </span>

      <h2 id="contador-titulo">
        Publicado há
      </h2>

      <p className="contador-descricao">
        Desde 17 de julho de 2026.
      </p>

      <div className="contador-grid">
        {itens.map((item) => (
          <article
            key={item.texto}
            className="contador-card"
          >
            <h3>
              {String(item.valor).padStart(2, "0")}
            </h3>

            <span>{item.texto}</span>
          </article>
        ))}
      </div>
    </section>
  );
}