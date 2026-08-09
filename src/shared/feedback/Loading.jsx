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

        <span className="sr-only">
          Abrindo seu Abrigo…
        </span>
      </div>
    </div>
  );
}
