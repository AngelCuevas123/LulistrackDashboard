
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { supabase } from "./services/supabase";

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

const API_URL = "https://backendlulistrack.onrender.com";

function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [acceso, setAcceso] = useState("cargando");

  // Obtener y escuchar la sesion de Supabase
  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;

      if (error) {
        console.error("Error al recuperar la sesion:", error);
      }

      setSesion(data?.session ?? null);
      setCargando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      setCargando(false);
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  // Verificar que la sesion pertenezca al administrador
  useEffect(() => {
    let activo = true;
    const controller = new AbortController();

    async function verificarAcceso() {
      if (!sesion?.access_token) {
        setAcceso("sin_sesion");
        return;
      }

      setAcceso("cargando");

      try {
        const respuesta = await fetch(`${API_URL}/drivers/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sesion.access_token}`,
          },
          signal: controller.signal,
        });

        if (!activo) return;

        if (respuesta.status === 200) {
          setAcceso("autorizado");
        } else if (respuesta.status === 401 || respuesta.status === 403) {
          setAcceso("denegado");
        } else {
          setAcceso("error");
        }
      } catch (error) {
        if (error.name !== "AbortError" && activo) {
          console.error("Error al verificar permisos:", error);
          setAcceso("error");
        }
      }
    }

    verificarAcceso();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [sesion?.access_token]);

  // Cerrar sesion
  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesion:", error);
      alert("No se pudo cerrar la sesion.");
    } else {
      setSesion(null);
      setAcceso("sin_sesion");
    }
  };

  if (cargando || (sesion && acceso === "cargando")) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Lulistrack</h2>
          <p>Verificando tu acceso...</p>
        </div>
      </div>
    );
  }

  // Usuario autenticado, pero sin permisos de administrador
  if (sesion && acceso === "denegado") {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Lulistrack</h2>
          <p>No tienes permisos para acceder al panel administrativo.</p>
          <button onClick={cerrarSesion}>
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  // Error de conexion con el backend
  if (sesion && acceso === "error") {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Lulistrack</h2>
          <p>No se pudo verificar tu acceso al servidor.</p>
          <button onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
          <button onClick={cerrarSesion}>
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!sesion ? (
        <Login />
      ) : acceso === "autorizado" ? (
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
      ) : (
        <Login />
      )}
    </BrowserRouter>
  );
}

export default App;

