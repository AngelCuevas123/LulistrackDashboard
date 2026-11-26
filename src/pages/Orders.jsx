
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Package,
  RefreshCw,
  X,
  Clock,
  User,
  Hash,
  ListFilter,
  Flag
} from "lucide-react";

import { obtenerPedidos, crearPedido, obtenerProductos, actualizarPrioridad } from "../services/api";
import LocationPicker from "../components/LocationPicker";
import AddressAutocomplete from "../components/AddressAutocomplete";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  const [formulario, setFormulario] = useState({
    client_name: "",
    address: "",
    colony: "",
    postal_code: "",
    state: "",
    municipality: "",
    locality: "",
    street: "",
    exterior_number: "",
    interior_number: "",
    address_references: "",
    estimated_time: "",
    latitude: "",
    longitude: "",
    is_priority: false
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

      if (formulario.latitude === "" || formulario.longitude === "") {
        setError("Selecciona el punto exacto de entrega en el mapa.");
        return;
      }

      const datos = {
        client_name: formulario.client_name,
        address: [
          [formulario.street, formulario.exterior_number ? `No. ${formulario.exterior_number}` : "", formulario.interior_number ? `Int. ${formulario.interior_number}` : ""].filter(Boolean).join(" "),
          formulario.colony,
          formulario.locality,
          formulario.municipality,
          formulario.state,
          formulario.postal_code ? `C.P. ${formulario.postal_code}` : ""
        ].filter(Boolean).join(", "),
        colony: formulario.colony || formulario.locality || formulario.municipality || "Sin asentamiento",
        postal_code: formulario.postal_code || null,
        state: formulario.state || null,
        municipality: formulario.municipality || null,
        locality: formulario.locality || null,
        street: formulario.street || null,
        exterior_number: formulario.exterior_number || null,
        interior_number: formulario.interior_number || null,
        address_references: formulario.address_references || null,
        estimated_time: formulario.estimated_time,
        is_priority: formulario.is_priority,
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

      const pedidoCreado = await crearPedido(datos);

      setMensaje(`Pedido ${pedidoCreado.tracking_number} registrado correctamente.`);

      setFormulario({
        client_name: "",
        address: "",
        colony: "",
        postal_code: "",
        state: "",
        municipality: "",
        locality: "",
        street: "",
        exterior_number: "",
        interior_number: "",
        address_references: "",
        estimated_time: "",
        latitude: "",
        longitude: "",
        is_priority: false
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
    const coincidePrioridad = filtroPrioridad === "todos" ||
      (filtroPrioridad === "prioritarios" ? Boolean(order.is_priority) : !order.is_priority);
    return coincideTexto && coincideEstado && coincidePrioridad;
  });

  async function cambiarPrioridad(order) {
    try {
      setError("");
      const actualizado = await actualizarPrioridad(order.id, !order.is_priority);
      setOrders((actuales) => actuales.map((actual) =>
        actual.id === actualizado.id ? actualizado : actual
      ));
    } catch (err) {
      setError(err.message || "No se pudo actualizar la prioridad del pedido.");
    }
  }

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

        <div className="orders-priority-filter">
          <Flag size={17} />
          <label htmlFor="filtro-prioridad-pedidos">Prioridad</label>
          <select
            id="filtro-prioridad-pedidos"
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
          >
            <option value="todos">Todas las prioridades</option>
            <option value="prioritarios">Prioritarios</option>
            <option value="no-prioritarios">No prioritarios</option>
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
                          <th>Prioridad</th>
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
                            <td>
                              <button
                                type="button"
                                className={`priority-toggle ${order.is_priority ? "is-priority" : ""}`}
                                onClick={() => cambiarPrioridad(order)}
                                disabled={order.status === "entregado"}
                                title={order.status === "entregado" ? "El pedido ya fue entregado" : "Cambiar prioridad"}
                              >
                                <Flag size={14} />
                                {order.is_priority ? "Prioritario" : "No prioritario"}
                              </button>
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

              <div className="tracking-number-auto">
                <div className="tracking-number-auto-icon"><Hash size={18} /></div>
                <div>
                  <strong>Folio de seguimiento automático</strong>
                  <p>Se generará al registrar el pedido. No necesitas capturarlo.</p>
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

              <AddressAutocomplete
                value={formulario}
                onChange={(cambios) => setFormulario((actual) => ({ ...actual, ...cambios }))}
                onCoordinates={({ latitude, longitude }) => setFormulario((actual) => ({
                  ...actual,
                  latitude: String(latitude),
                  longitude: String(longitude)
                }))}
              />

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

              <div className="form-group location-picker-group">
                <label>Ubicación exacta de entrega</label>
                <p className="form-help">Haz clic en el mapa para colocar el marcador. Puedes arrastrarlo para ajustar el punto.</p>
                <LocationPicker
                  latitude={formulario.latitude}
                  longitude={formulario.longitude}
                  onChange={({ latitude, longitude }) => setFormulario((actual) => ({
                    ...actual,
                    latitude: String(latitude),
                    longitude: String(longitude)
                  }))}
                />
                <div className="location-picker-coordinates">
                  <span>Latitud: <strong>{formulario.latitude || "Pendiente"}</strong></span>
                  <span>Longitud: <strong>{formulario.longitude || "Pendiente"}</strong></span>
                </div>
              </div>

              <div className="form-group priority-form-group">
                <label className="priority-checkbox">
                  <input
                    type="checkbox"
                    checked={formulario.is_priority}
                    onChange={(e) => setFormulario((actual) => ({
                      ...actual,
                      is_priority: e.target.checked
                    }))}
                  />
                  <span><Flag size={16} /> Marcar este pedido como prioritario</span>
                </label>
                <p className="form-help">Los pedidos prioritarios se identificarán en el listado para darles atención preferente.</p>
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
