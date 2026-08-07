import "./Novidades.css";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

const RELEASE_NOTES = Object.freeze([
  { version: "2.8", title: "Mais controle, sem pesar", items: [
    "Bloqueio local opcional e espaços Visitante e Demonstração.",
    "Leitura, contraste e instalação PWA mais confortáveis.",
    "Memórias, busca e Meu Dia com controles mais delicados.",
    "Simplificação do menu e até três atalhos escolhidos por você.",
  ] },
  { version: "2.7", title: "O Abrigo ganhou mais atmosfera", items: [
    "Céu contínuo, Modo Só Ficar e personalização em Meu Abrigo.",
    "Cápsulas para o futuro e memórias locais controláveis.",
  ] },
]);

export default function Novidades() {
  return <><Navbar /><Container><PageHeader title="Novidades"
    subtitle="O que mudou no Abrigo, em linguagem simples." />
    <div className="news-list">{RELEASE_NOTES.map((release) => <GlassCard key={release.version} hover={false}>
      <span>Versão {release.version}</span><h2>{release.title}</h2>
      <ul>{release.items.map((item) => <li key={item}>{item}</li>)}</ul>
    </GlassCard>)}</div>
  </Container></>;
}
