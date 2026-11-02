
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders.jsx";
import Drivers from "./pages/Drivers";
import Tracking from "./pages/Tracking.jsx";
import History from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";

import "./styles/global.css";

function App() {
  const [usuario, setUsuario] = useState(
    () => localStorage.getItem("luli_sesion") || ""
  );

  const iniciarSesion = (nombreUsuario) => {
    localStorage.setItem("luli_sesion", nombreUsuario);
    setUsuario(nombreUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("luli_sesion");
    setUsuario("");
  };

  return (
    <BrowserRouter>
      {!usuario ? (
        <Login onLogin={iniciarSesion} />
      ) : (
        <div className="app-container">
          <Sidebar onLogout={cerrarSesion} />

          <main className="main-content">
            <Header />

            <div className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/tracking" element={<Tracking />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;

