import "./Container.css";

export default function Container({ children }) {
  return (
    <main className="abrigo-container">
      {children}
    </main>
  );
}