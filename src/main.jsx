
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Restaurar el tema antes del primer render para evitar un destello blanco.
try {
  const temaGuardado = window.localStorage.getItem("luli_tema");
  document.documentElement.dataset.theme = temaGuardado === "oscuro" ? "oscuro" : "claro";
} catch {
  document.documentElement.dataset.theme = "claro";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

