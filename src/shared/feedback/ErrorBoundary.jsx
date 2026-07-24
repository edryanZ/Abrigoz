import { Component } from "react";
import "./ErrorBoundary.css";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error("Erro capturado pelo ErrorBoundary:", error);
    console.error(info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary"
          role="alert"
          aria-live="assertive"
        >
          <div className="error-card">
            <div
              className="error-icon"
              aria-hidden="true"
            >
              ☾
            </div>

            <h1>Ocorreu um erro</h1>

            <p>
              {this.props.message ??
                "Algo inesperado aconteceu durante a execução do Abrigo."}
            </p>

            <button
              onClick={this.handleReload}
              aria-label="Recarregar o aplicativo"
            >
              Recarregar aplicativo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}