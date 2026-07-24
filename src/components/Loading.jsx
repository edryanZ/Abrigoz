import "./Loading.css";

export default function Loading() {
  return (
    <div
      className="loading-container"
      role="status"
      aria-live="polite"
    >
      <div className="loading-content">
        <div
          className="loading-moon"
          aria-hidden="true"
        >
          ☾
        </div>

        <h1 className="loading-title">
          Abrigo
        </h1>

        <p className="loading-version">
          v2.0
        </p>

        <div
          className="loading-spinner"
          aria-hidden="true"
        />

        <span className="sr-only">
          Carregando...
        </span>
      </div>
    </div>
  );
}