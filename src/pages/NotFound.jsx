import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="notfound">

      <div className="notfound-card">

        <div className="notfound-icon">
          ☾
        </div>

        <h1>404</h1>

        <h2>Página não encontrada</h2>

        <p>
          A página que você tentou acessar não existe ou foi movida.
        </p>

        <Link
          to="/lar"
          className="notfound-button"
        >
          Voltar ao Lar
        </Link>

      </div>

    </main>
  );
}