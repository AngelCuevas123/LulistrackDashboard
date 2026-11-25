
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Package,
  RefreshCw,
  X,
  MapPin,
  Clock,
  User,
  Hash,
  ListFilter
} from "lucide-react";

import { obtenerPedidos, crearPedido, obtenerProductos } from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

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

  async function abrirFormulario() {
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
    setItems([]);
    setCargandoProductos(true);

    try {
      const catalogo = await obtenerProductos();
      setProductos(Array.isArray(catalogo) ? catalogo : []);
    } catch (err) {
      setError(err.message || "No se pudo consultar el inventario.");
    } finally {
      setCargandoProductos(false);
    }
  }

  function agregarProductoAlPedido() {
    setItems((actuales) => [...actuales, { product_id: "", quantity: "1" }]);
  }

  function cambiarProductoDelPedido(index, campo, valor) {
    setItems((actuales) => actuales.map((item, i) =>
      i === index ? { ...item, [campo]: valor } : item
    ));
  }

  function quitarProductoDelPedido(index) {
    setItems((actuales) => actuales.filter((_, i) => i !== index));
  }

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

      if (items.length === 0) {
        setError("Agrega al menos un producto para validar las existencias del pedido.");
        return;
      }

      const cantidades = new Map();
      for (const item of items) {
        const cantidad = Number(item.quantity);
        if (!item.product_id || !Number.isInteger(cantidad) || cantidad <= 0) {
          setError("Selecciona un producto y una cantidad válida en cada partida.");
          return;
        }
        cantidades.set(item.product_id, (cantidades.get(item.product_id) || 0) + cantidad);
      }

      for (const [productId, cantidad] of cantidades.entries()) {
        const producto = productos.find((p) => p.id === productId);
        if (!producto || cantidad > producto.stock_quantity) {
          setError(`Existencias insuficientes para ${producto?.name || "uno de los productos"}. Actualiza el inventario antes de continuar.`);
          return;
        }
      }

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
          : Number(formulario.longitude),
        items: Array.from(cantidades.entries()).map(([product_id, quantity]) => ({
          product_id,
          quantity
        }))
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
      setItems([]);

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
    const coincideTexto = (
      (order.tracking_number || "").toLowerCase().includes(texto) ||
      (order.client_name || "").toLowerCase().includes(texto) ||
      (order.address || "").toLowerCase().includes(texto)
    );
    const coincideEstado = filtroEstado === "todos" || order.status === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  // Agrupar únicamente con created_at enviado por el backend.
  // Los registros antiguos sin fecha confiable permanecen identificados como tales.
  const gruposPedidos = (() => {
    const grupos = new Map();
    pedidosFiltrados.forEach((order) => {
      const fecha = order.created_at ? new Date(order.created_at) : null;
      const clave = fecha && !Number.isNaN(fecha.getTime())
        ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
        : "sin-fecha";
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(order);
    });
    return [...grupos.entries()].sort(([a], [b]) => {
      if (a === "sin-fecha") return 1;
      if (b === "sin-fecha") return -1;
      return b.localeCompare(a);
    });
  })();

  const etiquetaDia = (clave) => {
    if (clave === "sin-fecha") return "Fecha no registrada";
    const [year, month, day] = clave.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    const mismaFecha = (a, b) => a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (mismaFecha(fecha, hoy)) return "Hoy";
    if (mismaFecha(fecha, ayer)) return "Ayer";
    return fecha.toLocaleDateString("es-MX", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  };



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
          onClick={abrirFormulario}
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
        <div className="orders-status-filter">
          <ListFilter size={17} />
          <label htmlFor="filtro-estado-pedidos">Estado</label>
          <select
            id="filtro-estado-pedidos"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los pedidos</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_transito">En tránsito</option>
            <option value="entregado">Entregados</option>
          </select>
        </div>

        <div className="orders-day-groups">
          {cargando ? (
            <div className="empty-table">Cargando pedidos...</div>
          ) : gruposPedidos.length > 0 ? (
            gruposPedidos.map(([dia, pedidosDelDia], index) => {
              const pendientesDia = pedidosDelDia.filter((pedido) => pedido.status === "pendiente").length;
              const transitoDia = pedidosDelDia.filter((pedido) => pedido.status === "en_transito").length;
              const entregadosDia = pedidosDelDia.filter((pedido) => pedido.status === "entregado").length;
              return (
                <details className="day-accordion" key={dia} open={index === 0}>
                  <summary className="day-accordion-summary">
                    <span className="day-accordion-date">
                      <strong>{etiquetaDia(dia)}</strong>
                      <small>{pedidosDelDia.length} {pedidosDelDia.length === 1 ? "pedido" : "pedidos"}</small>
                    </span>
                    <span className="day-accordion-counts">
                      <span className="day-count pending">{pendientesDia} pendientes</span>
                      <span className="day-count transit">{transitoDia} en ruta</span>
                      <span className="day-count delivered">{entregadosDia} entregados</span>
                    </span>
                    <span className="day-accordion-chevron">⌄</span>
                  </summary>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Seguimiento</th>
                          <th>Cliente</th>
                          <th>Dirección</th>
                          <th>Productos</th>
                          <th>Estado</th>
                          <th>Entrega estimada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosDelDia.map((order) => (
                          <tr key={order.id}>
                            <td className="tracking-number">{order.tracking_number || "Sin número"}</td>
                            <td>{order.client_name || "Sin cliente"}</td>
                            <td>{order.address || "Sin dirección"}</td>
                            <td className="order-items-summary" title={(order.items || []).map((item) => `${item.product_name} × ${item.quantity}`).join(", ")}>
                              {order.items?.length ? `${order.items.length} artículo(s)` : "Sin detalle"}
                            </td>
                            <td><span className={`status-badge ${order.status}`}>{(order.status || "sin estado").replaceAll("_", " ")}</span></td>
                            <td>{order.estimated_time || "Sin definir"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })
          ) : (
            <div className="empty-table">
              {orders.length === 0 ? "Todavía no hay pedidos registrados." : "No se encontraron pedidos con esos filtros."}
            </div>
          )}
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

              <div className="form-group inventory-order-products">
                <div className="orders-toolbar">
                  <div>
                    <label>Productos del pedido</label>
                    <p>Las cantidades se validan y descuentan del inventario al guardar.</p>
                  </div>
                  <button
                    type="button"
                    className="refresh-button"
                    onClick={agregarProductoAlPedido}
                    disabled={cargandoProductos || productos.length === 0}
                  >
                    <Plus size={16} />
                    Agregar producto
                  </button>
                </div>

                {cargandoProductos ? (
                  <p className="empty-table">Consultando existencias...</p>
                ) : productos.length === 0 ? (
                  <div className="empty-table">
                    No hay productos activos en el inventario. <Link to="/inventory">Registrar productos</Link>
                  </div>
                ) : items.length === 0 ? (
                  <p className="empty-table">Agrega los productos que solicita el cliente.</p>
                ) : (
                  items.map((item, index) => {
                    const producto = productos.find((p) => p.id === item.product_id);
                    return (
                      <div className="form-row inventory-order-item" key={index}>
                        <div className="form-group">
                          <label>Producto</label>
                          <select
                            value={item.product_id}
                            onChange={(e) => cambiarProductoDelPedido(index, "product_id", e.target.value)}
                            required
                          >
                            <option value="">Selecciona un producto</option>
                            {productos.map((opcion) => (
                              <option
                                key={opcion.id}
                                value={opcion.id}
                                disabled={opcion.stock_quantity <= 0}
                              >
                                {opcion.name} · {opcion.stock_quantity} disponibles
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Cantidad {producto ? `(máx. ${producto.stock_quantity})` : ""}</label>
                          <input
                            type="number"
                            min="1"
                            max={producto?.stock_quantity ?? undefined}
                            step="1"
                            value={item.quantity}
                            onChange={(e) => cambiarProductoDelPedido(index, "quantity", e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => quitarProductoDelPedido(index)}
                          aria-label="Quitar producto"
                        >
                          <X size={17} />
                        </button>
                      </div>
                    );
                  })
                )}
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
                  disabled={guardando || cargandoProductos || items.length === 0 || productos.length === 0}
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
