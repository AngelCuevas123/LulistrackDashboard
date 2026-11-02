
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Users,
  RefreshCw,
  X,
  User,
  Mail,
  LockKeyhole,
  Truck,
  ClipboardList,
  Package
} from "lucide-react";

import {
  obtenerRepartidores,
  crearRepartidor,
  obtenerPedidos,
  asignarPedido
} from "../services/api";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [conductorSeleccionado, setConductorSeleccionado] = useState(null);

  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState("");

  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [asignando, setAsignando] = useState(false);

  const [formulario, setFormulario] = useState({
    name: "",
    email: "",
    password: "",
    vehicle: ""
  });

  // Consultar repartidores
  async function cargarRepartidores() {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerRepartidores();
      setDrivers(Array.isArray(datos) ? datos : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarRepartidores();
  }, []);

  // Actualizar formulario de registro
  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  }

  // Registrar repartidor
  async function manejarRegistro(e) {
    e.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const datos = {
        name: formulario.name.trim(),
        email: formulario.email.trim(),
        password: formulario.password,
        vehicle: formulario.vehicle.trim()
      };

      await crearRepartidor(datos);

      setMensaje("Repartidor registrado correctamente.");

      setFormulario({
        name: "",
        email: "",
        password: "",
        vehicle: ""
      });

      setMostrarFormulario(false);

      await cargarRepartidores();

    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Abrir ventana de asignacion
  async function abrirAsignacion(driver) {
    setError("");
    setMensaje("");

    setConductorSeleccionado(driver);
    setPedidoSeleccionado("");
    setPedidosDisponibles([]);
    setMostrarAsignacion(true);

    try {
      setCargandoPedidos(true);

      const datos = await obtenerPedidos();

      // Mostrar solamente pedidos sin repartidor y no entregados
      const disponibles = (Array.isArray(datos) ? datos : []).filter(
        (pedido) =>
          !pedido.driver_id &&
          pedido.status !== "entregado"
      );

      setPedidosDisponibles(disponibles);

      if (disponibles.length > 0) {
        setPedidoSeleccionado(disponibles[0].id);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoPedidos(false);
    }
  }

  // Confirmar asignacion
  async function manejarAsignacion(e) {
    e.preventDefault();

    if (!pedidoSeleccionado || !conductorSeleccionado) {
      setError("Selecciona un pedido para continuar.");
      return;
    }

    try {
      setAsignando(true);
      setError("");
      setMensaje("");

      await asignarPedido(
        pedidoSeleccionado,
        conductorSeleccionado.driver_id
      );

      setMensaje(
        `Pedido asignado correctamente a ${conductorSeleccionado.name}.`
      );

      setMostrarAsignacion(false);
      setConductorSeleccionado(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setAsignando(false);
    }
  }

  // Buscador de repartidores
  const repartidoresFiltrados = drivers.filter((driver) => {
    const texto = busqueda.toLowerCase();

    return (
      (driver.name || "").toLowerCase().includes(texto) ||
      (driver.driver_id || "").toLowerCase().includes(texto) ||
      (driver.vehicle || "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="orders-page">

      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">GESTION LOGISTICA</span>
          <h1>Repartidores</h1>
          <p>Administra el equipo de entregas de Lulistrack.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setMensaje("");
            setMostrarFormulario(true);
          }}
        >
          <Plus size={19} />
          Nuevo repartidor
        </button>
      </div>

      {mensaje && (
        <div className="success-message">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="orders-summary">
        <div className="summary-icon">
          <Users size={24} />
        </div>

        <div>
          <span>Repartidores registrados</span>
          <h2>{drivers.length}</h2>
          <p>Equipo registrado en la plataforma</p>
        </div>
      </div>

      <div className="orders-card">

        <div className="orders-toolbar">
          <div>
            <h3>Listado de repartidores</h3>
            <p>Informacion obtenida desde el servidor</p>
          </div>

          <button
            className="refresh-button"
            onClick={cargarRepartidores}
            disabled={cargando}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        <div className="orders-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar por nombre, ID o vehiculo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Repartidor</th>
                <th>Vehiculo</th>
                <th>Entregas completadas</th>
                <th>Tiempo promedio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Cargando repartidores...
                  </td>
                </tr>
              ) : repartidoresFiltrados.length > 0 ? (
                repartidoresFiltrados.map((driver) => (
                  <tr key={driver.driver_id}>
                    <td className="tracking-number">
                      {driver.driver_id}
                    </td>

                    <td>{driver.name}</td>

                    <td>
                      <span className="driver-vehicle">
                        <Truck size={15} />
                        {driver.vehicle}
                      </span>
                    </td>

                    <td>{driver.completed_deliveries ?? 0}</td>

                    <td>{driver.average_time || "Sin datos"}</td>

                    <td>
                      <button
                        className="refresh-button"
                        onClick={() => abrirAsignacion(driver)}
                      >
                        <ClipboardList size={16} />
                        Asignar pedido
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No se encontraron repartidores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-footer">
          Mostrando {repartidoresFiltrados.length} de {drivers.length} repartidores
        </div>

      </div>

      {/* Ventana para registrar repartidores */}
      {mostrarFormulario && (
        <div className="modal-overlay">

          <div className="order-modal">

            <div className="modal-header">
              <div>
                <h2>Registrar repartidor</h2>
                <p>Crea su perfil y cuenta de acceso.</p>
              </div>

              <button
                type="button"
                className="close-modal"
                onClick={() => setMostrarFormulario(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={manejarRegistro}>

              <div className="form-group">
                <label>Nombre completo</label>

                <div className="form-input">
                  <User size={18} />

                  <input
                    name="name"
                    value={formulario.name}
                    onChange={manejarCambio}
                    placeholder="Nombre del repartidor"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo electronico</label>

                <div className="form-input">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={manejarCambio}
                    placeholder="repartidor@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña inicial</label>

                <div className="form-input">
                  <LockKeyhole size={18} />

                  <input
                    type="password"
                    name="password"
                    value={formulario.password}
                    onChange={manejarCambio}
                    placeholder="Minimo 8 caracteres"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vehiculo</label>

                <div className="form-input">
                  <Truck size={18} />

                  <input
                    name="vehicle"
                    value={formulario.vehicle}
                    onChange={manejarCambio}
                    placeholder="Motocicleta, bicicleta, camioneta..."
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={guardando}
                >
                  {guardando ? "Registrando..." : "Crear repartidor"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Ventana para asignar pedidos */}
      {mostrarAsignacion && (
        <div className="modal-overlay">

          <div className="order-modal">

            <div className="modal-header">
              <div>
                <h2>Asignar pedido</h2>
                <p>
                  Repartidor:{" "}
                  <strong>{conductorSeleccionado?.name}</strong>
                </p>
              </div>

              <button
                type="button"
                className="close-modal"
                onClick={() => setMostrarAsignacion(false)}
                disabled={asignando}
              >
                <X size={22} />
              </button>
            </div>

            {cargandoPedidos ? (
              <div className="empty-table">
                Cargando pedidos disponibles...
              </div>
            ) : pedidosDisponibles.length > 0 ? (

              <form onSubmit={manejarAsignacion}>

                <div className="form-group">
                  <label>Selecciona un pedido</label>

                  <div className="form-input">
                    <Package size={18} />

                    <select
                      value={pedidoSeleccionado}
                      onChange={(e) => setPedidoSeleccionado(e.target.value)}
                      required
                    >
                      {pedidosDisponibles.map((pedido) => (
                        <option key={pedido.id} value={pedido.id}>
                          {pedido.tracking_number} - {pedido.client_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {pedidoSeleccionado && (
                  <div className="orders-summary">
                    <div className="summary-icon">
                      <Package size={22} />
                    </div>

                    <div>
                      <span>Pedido seleccionado</span>
                      <h3>
                        {
                          pedidosDisponibles.find(
                            (pedido) => pedido.id === pedidoSeleccionado
                          )?.tracking_number
                        }
                      </h3>
                      <p>
                        {
                          pedidosDisponibles.find(
                            (pedido) => pedido.id === pedidoSeleccionado
                          )?.address
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setMostrarAsignacion(false)}
                    disabled={asignando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={asignando || !pedidoSeleccionado}
                  >
                    {asignando ? "Asignando..." : "Confirmar asignacion"}
                  </button>
                </div>

              </form>

            ) : (
              <div className="empty-table">
                <Package size={30} />
                <p>No hay pedidos disponibles para asignar.</p>
                <span>
                  Primero registra un pedido o revisa si ya fue asignado.
                </span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default Drivers;
