import "./FraseDoDia.css";
import { useMemo } from "react";

const frases = [
  "Grandes projetos começam com pequenas ideias.",
  "Cada linha de código faz o Abrigo crescer.",
  "O melhor momento para construir algo incrível é agora.",
  "Toda atualização deixa o Abrigo mais completo.",
  "Cada detalhe importa quando se cria um lugar especial.",
  "Projetos evoluem um passo de cada vez.",
  "A constância transforma ideias em realidade.",
  "Pequenos avanços de hoje são grandes resultados amanhã.",
  "Toda versão conta uma parte da história.",
  "Construir também é uma forma de guardar memórias.",
  "A criatividade encontra espaço onde existe dedicação.",
  "Cada melhoria torna o Abrigo mais acolhedor.",
  "Nenhum projeto nasce perfeito, ele evolui.",
  "Persistência vale mais que velocidade.",
  "O importante é continuar desenvolvendo.",
  "Todo dia é uma oportunidade para melhorar.",
  "Ideias simples podem se tornar grandes projetos.",
  "Cada atualização deixa sua marca na história do Abrigo.",
  "O desenvolvimento nunca para para quem gosta de criar.",
  "O Abrigo cresce junto com quem o constrói."
];

export default function FraseDoDia() {
  const frase = useMemo(() => {
    const hoje = new Date();

    const indice =
      (hoje.getFullYear() * 1000 +
        hoje.getMonth() * 100 +
        hoje.getDate()) %
      frases.length;

    return frases[indice];
  }, []);

  return (
    <section
      className="frase-dia"
      aria-labelledby="titulo-frase"
    >
      <span className="frase-tag">
        ✨ Frase do dia
      </span>

      <h2 id="titulo-frase">
        Uma inspiração para hoje
      </h2>

      <blockquote>
        "{frase}"
      </blockquote>
    </section>
  );
}