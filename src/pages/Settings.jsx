
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Monitor,
  Server,
  Save,
  CheckCircle,
  RefreshCw
} from "lucide-react";

const API_URL = "https://backendlulistrack.onrender.com";

function Settings() {
  const [seccion, setSeccion] = useState("perfil");
  const [guardado, setGuardado] = useState(false);
  const [estadoServidor, setEstadoServidor] = useState("Comprobando...");

  const [perfil, setPerfil] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("luli_perfil")) || {
        nombre: "Administrador",
        correo: "",
        cargo: "Administrador"
      };
    } catch {
      return {
        nombre: "Administrador",
        correo: "",
        cargo: "Administrador"
      };
    }
  });

  const [notificaciones, setNotificaciones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("luli_notificaciones")) || {
        entregas: true,
        pedidos: true,
        incidencias: true
      };
    } catch {
      return {
        entregas: true,
        pedidos: true,
        incidencias: true
      };
    }
  });

  const [tema, setTema] = useState(
    () => localStorage.getItem("luli_tema") || "claro"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
  }, [tema]);

  const guardarPerfil = () => {
    localStorage.setItem("luli_perfil", JSON.stringify(perfil));
    mostrarGuardado();
  };

  const guardarNotificaciones = (nuevas) => {
    setNotificaciones(nuevas);
    localStorage.setItem("luli_notificaciones", JSON.stringify(nuevas));
  };

  const cambiarTema = (nuevoTema) => {
    setTema(nuevoTema);
    localStorage.setItem("luli_tema", nuevoTema);
  };

  const mostrarGuardado = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const comprobarServidor = async () => {
    setEstadoServidor("Comprobando...");

    try {
      const respuesta = await fetch(`${API_URL}/openapi.json`);

      if (!respuesta.ok) {
        throw new Error("Servidor no disponible");
      }

      setEstadoServidor("Conectado");
    } catch {
      setEstadoServidor("Sin conexión");
    }
  };

  useEffect(() => {
    comprobarServidor();
  }, []);

  const opciones = [
    { id: "perfil", nombre: "Perfil", icono: User },
    { id: "notificaciones", nombre: "Notificaciones", icono: Bell },
    { id: "apariencia", nombre: "Apariencia", icono: Monitor },
    { id: "sistema", nombre: "Sistema", icono: Server }
  ];

  return (
    <div className="settings-page">

      <div className="dashboard-heading">
        <div>
          <h1>Configuración</h1>
          <p>Administra las preferencias de tu plataforma Lulistrack.</p>
        </div>
      </div>

      <div className="settings-layout">

        <aside className="settings-menu">
          <span className="sidebar-label">PREFERENCIAS</span>

          {opciones.map((opcion) => {
            const Icono = opcion.icono;

            return (
              <button
                key={opcion.id}
                className={
                  seccion === opcion.id
                    ? "settings-menu-item active"
                    : "settings-menu-item"
                }
                onClick={() => setSeccion(opcion.id)}
              >
                <Icono size={19} />
                <span>{opcion.nombre}</span>
              </button>
            );
          })}
        </aside>

        <section className="settings-content">

          {seccion === "perfil" && (
            <div>
              <div className="settings-section-heading">
                <h2>Perfil del administrador</h2>
                <p>Información general de tu cuenta.</p>
              </div>

              <div className="settings-avatar">
                {perfil.nombre.charAt(0).toUpperCase()}
              </div>

              <div className="settings-form">

                <label>Nombre completo</label>
                <input
                  value={perfil.nombre}
                  onChange={(e) =>
                    setPerfil({ ...perfil, nombre: e.target.value })
                  }
                  placeholder="Nombre del administrador"
                />

                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={perfil.correo}
                  onChange={(e) =>
                    setPerfil({ ...perfil, correo: e.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                />

                <label>Cargo</label>
                <input
                  value={perfil.cargo}
                  onChange={(e) =>
                    setPerfil({ ...perfil, cargo: e.target.value })
                  }
                />

                <button className="primary-button" onClick={guardarPerfil}>
                  <Save size={17} />
                  Guardar cambios
                </button>

                {guardado && (
                  <p className="settings-success">
                    <CheckCircle size={17} />
                    Cambios guardados correctamente.
                  </p>
                )}

              </div>
            </div>
          )}

          {seccion === "notificaciones" && (
            <div>
              <div className="settings-section-heading">
                <h2>Notificaciones</h2>
                <p>Personaliza tus preferencias de avisos.</p>
              </div>

              {[
                {
                  id: "pedidos",
                  titulo: "Nuevos pedidos",
                  descripcion: "Avisos cuando se registren nuevos pedidos."
                },
                {
                  id: "entregas",
                  titulo: "Entregas completadas",
                  descripcion: "Avisos cuando un repartidor complete una entrega."
                },
                {
                  id: "incidencias",
                  titulo: "Incidencias",
                  descripcion: "Avisos sobre problemas durante las entregas."
                }
              ].map((item) => (
                <div className="settings-option" key={item.id}>
                  <div>
                    <strong>{item.titulo}</strong>
                    <p>{item.descripcion}</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notificaciones[item.id]}
                    onChange={(e) =>
                      guardarNotificaciones({
                        ...notificaciones,
                        [item.id]: e.target.checked
                      })
                    }
                  />
                </div>
              ))}

              <p className="settings-note">
                Estas preferencias se guardan en este navegador.
                No activan notificaciones del sistema ni del celular.
              </p>
            </div>
          )}

          {seccion === "apariencia" && (
            <div>
              <div className="settings-section-heading">
                <h2>Apariencia</h2>
                <p>Personaliza la visualización del Dashboard.</p>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Tema claro</strong>
                  <p>Interfaz tradicional con fondos claros.</p>
                </div>

                <input
                  type="radio"
                  name="tema"
                  checked={tema === "claro"}
                  onChange={() => cambiarTema("claro")}
                />
              </div>

              <div className="settings-option">
                <div>
                  <strong>Tema oscuro</strong>
                  <p>Interfaz con tonos oscuros.</p>
                </div>

                <input
                  type="radio"
                  name="tema"
                  checked={tema === "oscuro"}
                  onChange={() => cambiarTema("oscuro")}
                />
              </div>

              <p className="settings-note">
                La selección se guarda en este navegador.
              </p>
            </div>
          )}

          {seccion === "sistema" && (
            <div>
              <div className="settings-section-heading">
                <h2>Información del sistema</h2>
                <p>Estado de los servicios de Lulistrack.</p>
              </div>

              <div className="settings-system-card">
                <div>
                  <strong>Backend API</strong>
                  <p>{API_URL}</p>
                </div>

                <span
                  className={
                    estadoServidor === "Conectado"
                      ? "system-status online"
                      : "system-status offline"
                  }
                >
                  {estadoServidor}
                </span>
              </div>

              <div className="settings-system-card">
                <div>
                  <strong>Plataforma</strong>
                  <p>Dashboard web Lulistrack</p>
                </div>
                <span className="system-status online">Activo</span>
              </div>

              <button
                className="refresh-button"
                onClick={comprobarServidor}
              >
                <RefreshCw size={17} />
                Comprobar conexión
              </button>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}

export default Settings;
