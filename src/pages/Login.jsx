
import { useState } from "react";
import { Box, LockKeyhole, User } from "lucide-react";

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const iniciarSesion = (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Ingresa un usuario y una contraseña.");
      return;
    }

    onLogin(usuario.trim());
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Box size={32} />
        </div>

        <h1>Lulistrack</h1>
        <p className="login-subtitle">
          Panel de administración
        </p>

        <form onSubmit={iniciarSesion}>
          <label>Usuario</label>
          <div className="login-input">
            <User size={18} />
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <label>Contraseña</label>
          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        <p className="login-footer">
          Lulistrack · Gestión de entregas
        </p>
      </div>
    </div>
  );
}

export default Login;
