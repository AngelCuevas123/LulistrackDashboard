
import { useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe
} from "lucide-react";

import { supabase } from "../services/supabase";

function Login() {
  const [modo, setModo] = useState("login");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError("");
    setMensaje("");
    setContrasena("");
    setMostrarPassword(false);
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: contrasena
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("No se pudo conectar con el servicio de inicio de sesión.");
    } finally {
      setCargando(false);
    }
  };

  const recuperarContrasena = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        correo.trim(),
        {
          redirectTo: window.location.origin
        }
      );

      if (error) {
        setError(error.message);
      } else {
        setMensaje(
          "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."
        );
      }
    } catch {
      setError("No se pudo enviar la solicitud. Inténtalo nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const enviarFormulario =
    modo === "login" ? iniciarSesion : recuperarContrasena;

  return (
    <main className="auth-layout">

      {/* PANEL VISUAL */}
      <section className="auth-visual">

        <div className="auth-visual-overlay"></div>

        <div className="auth-brand">
          <img
            src="/lulistrack-logo.png.png"
            alt="Lulistrack"
            className="auth-logo"
          />
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            LOGÍSTICA INTELIGENTE
          </span>

          <h1>
            Cada entrega
            <br />
            <span>cuenta.</span>
          </h1>

          <p>
            Mantén tus pedidos organizados, coordina tus entregas
            y sigue cada envío desde un solo lugar.
          </p>

          <div className="auth-feature">
            <div className="auth-feature-icon">
              <Globe size={20} />
            </div>

            <div>
              <strong>Todo bajo control</strong>
              <span>Gestiona tus entregas en tiempo real.</span>
            </div>
          </div>

          <div className="auth-visual-footer">
            <span>CONTROL · SEGUIMIENTO · CONFIANZA</span>
            <span>© 2026 Lulistrack</span>
          </div>
        </div>
      </section>

      {/* PANEL DE ACCESO */}
      <section className="auth-form-panel">

        <div className="auth-form-container">

          <div className="auth-mobile-brand">
            <img
              src="/lulistrack-logo.png"
              alt="Lulistrack"
            />
          </div>

          <div className="auth-heading">

            <span className="auth-welcome">
              {modo === "login"
                ? "BIENVENIDO DE NUEVO"
                : "ASISTENCIA DE CUENTA"}
            </span>

            <h2>
              {modo === "login"
                ? "Inicia sesión"
                : "Recupera tu acceso"}
            </h2>

            <p>
              {modo === "login"
                ? "Ingresa tus datos para acceder a tu plataforma."
                : "Te enviaremos instrucciones a tu correo electrónico."}
            </p>

          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="auth-alert auth-alert-success">
              {mensaje}
            </div>
          )}

          <form onSubmit={enviarFormulario} className="auth-form">

            <div className="auth-field">
              <label>Correo electrónico</label>

              <div className="auth-input-wrap">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
            </div>

            {modo === "login" && (
              <div className="auth-field">
                <label>Contraseña</label>

                <div className="auth-input-wrap">
                  <LockKeyhole size={18} />

                  <input
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setMostrarPassword(!mostrarPassword)
                    }
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {modo === "login" && (
              <div className="auth-forgot">
                <button
                  type="button"
                  onClick={() => cambiarModo("recuperar")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={cargando}
            >
              {cargando
                ? "Procesando..."
                : modo === "login"
                ? "Iniciar sesión"
                : "Enviar instrucciones"}
            </button>

          </form>

          {modo === "recuperar" && (
            <div className="auth-bottom">
              <button
                className="auth-back"
                type="button"
                onClick={() => cambiarModo("login")}
              >
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </button>
            </div>
          )}

          <div className="auth-security">
            <LockKeyhole size={14} />
            <span>Acceso seguro a tu plataforma</span>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Login;
