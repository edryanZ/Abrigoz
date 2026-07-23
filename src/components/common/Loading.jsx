import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-moon">☾</div>

        <h1 className="loading-title">
          Abrigo
        </h1>

        <p className="loading-version">
          v2.0
        </p>

        <div className="loading-spinner" />
      </div>
    </div>
  );
}