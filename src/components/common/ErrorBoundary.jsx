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
        <div className="error-boundary">
          <div className="error-card">

            <div className="error-icon">
              ☾
            </div>

            <h1>
              Ocorreu um erro
            </h1>

            <p>
              Algo inesperado aconteceu durante a execução do Abrigo.
            </p>

            <button onClick={this.handleReload}>
              Recarregar aplicativo
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}