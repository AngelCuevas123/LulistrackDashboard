
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Package,
  RefreshCw,
  X,
  MapPin,
  Clock,
  User,
  Hash
} from "lucide-react";

import { obtenerPedidos, crearPedido } from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [formulario, setFormulario] = useState({
    tracking_number: "",
    client_name: "",
    address: "",
    colony: "",
    estimated_time: "",
    latitude: "",
    longitude: ""
  });

  // Consultar pedidos del backend
  async function cargarPedidos() {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerPedidos();
      setOrders(Array.isArray(datos) ? datos : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
  }, []);

  // Actualizar formulario
  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  }

  // Registrar pedido
  async function manejarRegistro(e) {
    e.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const datos = {
        tracking_number: formulario.tracking_number,
        client_name: formulario.client_name,
        address: formulario.address,
        colony: formulario.colony,
        estimated_time: formulario.estimated_time,
        latitude: formulario.latitude === ""
          ? null
          : Number(formulario.latitude),
        longitude: formulario.longitude === ""
          ? null
          : Number(formulario.longitude)
      };

      await crearPedido(datos);

      setMensaje("Pedido registrado correctamente.");

      setFormulario({
        tracking_number: "",
        client_name: "",
        address: "",
        colony: "",
        estimated_time: "",
        latitude: "",
        longitude: ""
      });

      setMostrarFormulario(false);

      await cargarPedidos();

    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Buscador
  const pedidosFiltrados = orders.filter((order) => {
    const texto = busqueda.toLowerCase();

    return (
      (order.tracking_number || "").toLowerCase().includes(texto) ||
      (order.client_name || "").toLowerCase().includes(texto) ||
      (order.address || "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="orders-page">

      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">GESTION LOGISTICA</span>
          <h1>Pedidos</h1>
          <p>Administra y consulta los envios de Lulistrack.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setMostrarFormulario(true)}
        >
          <Plus size={19} />
          Nuevo pedido
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
          <Package size={24} />
        </div>

        <div>
          <span>Pedidos registrados</span>
          <h2>{orders.length}</h2>
          <p>Pedidos pendientes de entrega o en proceso</p>
        </div>
      </div>

      <div className="orders-card">

        <div className="orders-toolbar">
          <div>
            <h3>Listado de pedidos</h3>
            <p>Informacion obtenida desde el servidor</p>
          </div>

          <button
            className="refresh-button"
            onClick={cargarPedidos}
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
            placeholder="Buscar por cliente, direccion o seguimiento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Seguimiento</th>
                <th>Cliente</th>
                <th>Direccion</th>
                <th>Estado</th>
                <th>Entrega estimada</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="empty-table">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : pedidosFiltrados.length > 0 ? (
                pedidosFiltrados.map((order) => (
                  <tr key={order.id}>
                    <td className="tracking-number">
                      {order.tracking_number}
                    </td>

                    <td>{order.client_name}</td>

                    <td>{order.address}</td>

                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {(order.status || "sin estado").replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>{order.estimated_time || "Sin definir"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-footer">
          Mostrando {pedidosFiltrados.length} de {orders.length} pedidos
        </div>

      </div>

      {/* Ventana para registrar pedidos */}
      {mostrarFormulario && (
        <div className="modal-overlay">

          <div className="order-modal">

            <div className="modal-header">
              <div>
                <h2>Registrar pedido</h2>
                <p>Ingresa los datos del nuevo envio.</p>
              </div>

              <button
                className="close-modal"
                onClick={() => setMostrarFormulario(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={manejarRegistro}>

              <div className="form-group">
                <label>Numero de seguimiento</label>
                <div className="form-input">
                  <Hash size={18} />
                  <input
                    name="tracking_number"
                    value={formulario.tracking_number}
                    onChange={manejarCambio}
                    placeholder="LUL-2026-004"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nombre del cliente</label>
                <div className="form-input">
                  <User size={18} />
                  <input
                    name="client_name"
                    value={formulario.client_name}
                    onChange={manejarCambio}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Direccion de entrega</label>
                <div className="form-input">
                  <MapPin size={18} />
                  <input
                    name="address"
                    value={formulario.address}
                    onChange={manejarCambio}
                    placeholder="Calle y numero"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Colonia</label>
                <input
                  name="colony"
                  value={formulario.colony}
                  onChange={manejarCambio}
                  placeholder="Nombre de la colonia"
                  required
                />
              </div>

              <div className="form-group">
                <label>Hora estimada de entrega</label>
                <div className="form-input">
                  <Clock size={18} />
                  <input
                    type="time"
                    name="estimated_time"
                    value={formulario.estimated_time}
                    onChange={manejarCambio}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitud (opcional)</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formulario.latitude}
                    onChange={manejarCambio}
                    placeholder="20.0000"
                  />
                </div>

                <div className="form-group">
                  <label>Longitud (opcional)</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formulario.longitude}
                    onChange={manejarCambio}
                    placeholder="-101.0000"
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
                  {guardando ? "Guardando..." : "Registrar pedido"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Orders;
