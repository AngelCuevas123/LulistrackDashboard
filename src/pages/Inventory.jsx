import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import {
  AlertTriangle,
  Archive,
  Boxes,
  Edit3,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  X
} from "lucide-react";

import {
  actualizarProducto,
  crearProducto,
  desactivarProducto,
  obtenerProductos
} from "../services/api";

const FORMULARIO_VACIO = {
  sku: "",
  name: "",
  description: "",
  unit: "pieza",
  stock_quantity: "0",
  min_stock: "0",
  unit_price: "0"
};

function Inventory() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      const datos = await obtenerProductos(mostrarInactivos);
      setProductos(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message || "No se pudo cargar el inventario.");
    } finally {
      setCargando(false);
    }
  }, [mostrarInactivos]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const productosActivos = productos.filter((producto) => producto.is_active);
  const productosAgotados = productosActivos.filter(
    (producto) => producto.stock_quantity === 0
  );
  const productosBajos = productosActivos.filter(
    (producto) =>
      producto.min_stock > 0 &&
      producto.stock_quantity > 0 &&
      producto.stock_quantity <= producto.min_stock
  );

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;

    return productos.filter((producto) =>
      [producto.name, producto.sku, producto.description]
        .some((valor) => (valor || "").toLowerCase().includes(texto))
    );
  }, [productos, busqueda]);

  const gruposInventario = [
    { key: "agotados", label: "Agotados", items: productosFiltrados.filter((p) => p.is_active && p.stock_quantity === 0) },
    { key: "bajos", label: "Stock bajo", items: productosFiltrados.filter((p) => p.is_active && p.stock_quantity > 0 && p.min_stock > 0 && p.stock_quantity <= p.min_stock) },
    { key: "disponibles", label: "Disponibles", items: productosFiltrados.filter((p) => p.is_active && !(p.stock_quantity === 0 || (p.min_stock > 0 && p.stock_quantity <= p.min_stock))) },
    { key: "inactivos", label: "Inactivos", items: productosFiltrados.filter((p) => !p.is_active) }
  ].filter((grupo) => grupo.items.length > 0);



  function abrirNuevoProducto() {
    setProductoEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function abrirEdicion(producto) {
    setProductoEditando(producto);
    setFormulario({
      sku: producto.sku || "",
      name: producto.name || "",
      description: producto.description || "",
      unit: producto.unit || "pieza",
      stock_quantity: String(producto.stock_quantity ?? 0),
      min_stock: String(producto.min_stock ?? 0),
      unit_price: String(producto.unit_price ?? 0)
    });
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  async function guardarProducto(evento) {
    evento.preventDefault();

    const datos = {
      sku: formulario.sku.trim().toUpperCase(),
      name: formulario.name.trim(),
      description: formulario.description.trim() || null,
      unit: formulario.unit.trim(),
      stock_quantity: Number(formulario.stock_quantity),
      min_stock: Number(formulario.min_stock),
      unit_price: Number(formulario.unit_price)
    };

    if (
      !Number.isInteger(datos.stock_quantity) ||
      !Number.isInteger(datos.min_stock) ||
      datos.stock_quantity < 0 ||
      datos.min_stock < 0 ||
      !Number.isFinite(datos.unit_price) ||
      datos.unit_price < 0
    ) {
      setError("Revisa las existencias, el mínimo y el precio.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      if (productoEditando) {
        await actualizarProducto(productoEditando.id, datos);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await crearProducto(datos);
        setMensaje("Producto agregado al inventario.");
      }

      setMostrarFormulario(false);
      setProductoEditando(null);
      setFormulario(FORMULARIO_VACIO);
      await cargarProductos();
    } catch (err) {
      setError(err.message || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(producto) {
    const accion = producto.is_active ? "desactivar" : "reactivar";
    if (!window.confirm(`¿Deseas ${accion} ${producto.name}?`)) return;

    try {
      setError("");
      setMensaje("");
      if (producto.is_active) {
        await desactivarProducto(producto.id);
      } else {
        await actualizarProducto(producto.id, { is_active: true });
      }
      setMensaje(producto.is_active
        ? "Producto desactivado. Su historial se conserva."
        : "Producto reactivado correctamente."
      );
      await cargarProductos();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el producto.");
    }
  }

  function estadoStock(producto) {
    if (!producto.is_active) return { texto: "Inactivo", clase: "pendiente" };
    if (producto.stock_quantity === 0) return { texto: "Agotado", clase: "pendiente" };
    if (producto.min_stock > 0 && producto.stock_quantity <= producto.min_stock) {
      return { texto: "Stock bajo", clase: "pendiente" };
    }
    return { texto: "Disponible", clase: "entregado" };
  }

  const moneda = (valor) => new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(valor) || 0);

  return (
    <div className="orders-page inventory-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">RECURSOS DEL NEGOCIO</span>
          <h1>Inventario</h1>
          <p>Controla los productos y verifica existencias al registrar pedidos.</p>
        </div>

        <button className="primary-button" onClick={abrirNuevoProducto}>
          <Plus size={19} />
          Nuevo producto
        </button>
      </div>

      {mensaje && <div className="success-message">{mensaje}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid inventory-stats">
        <div className="stat-card">
          <div className="stat-card-top"><span>Productos activos</span><div className="stat-icon blue"><Boxes size={21} /></div></div>
          <h2>{productosActivos.length}</h2><p>En el catálogo</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><span>Stock bajo</span><div className="stat-icon yellow"><AlertTriangle size={21} /></div></div>
          <h2>{productosBajos.length}</h2><p>Requieren reposición</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><span>Agotados</span><div className="stat-icon purple"><Archive size={21} /></div></div>
          <h2>{productosAgotados.length}</h2><p>Sin existencias</p>
        </div>
      </div>

      {(productosBajos.length > 0 || productosAgotados.length > 0) && (
        <div className="dashboard-error inventory-alert">
          <AlertTriangle size={18} />
          Hay {productosBajos.length + productosAgotados.length} producto(s) que necesitan atención antes de aceptar nuevos pedidos.
        </div>
      )}

      <div className="orders-card">
        <div className="orders-toolbar">
          <div>
            <h3>Productos del negocio</h3>
            <p>Las existencias se descuentan al registrar un pedido con productos.</p>
          </div>
          <button className="refresh-button" onClick={cargarProductos} disabled={cargando}>
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        <div className="orders-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Buscar por producto, SKU o descripción..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>

        <label className="inventory-inactive-toggle">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(evento) => setMostrarInactivos(evento.target.checked)}
          />
          Incluir productos inactivos
        </label>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Existencias</th>
                <th>Mínimo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="7" className="empty-table">Cargando inventario...</td></tr>
              ) : gruposInventario.length > 0 ? (
                gruposInventario.map((grupo) => (
                  <React.Fragment key={grupo.key}>
                    <tr className="driver-group-row inventory-group-row">
                      <td colSpan="7">{grupo.label}<span>{grupo.items.length}</span></td>
                    </tr>
                    {grupo.items.map((producto) => {
                      const estado = estadoStock(producto);
                      return (
                        <tr key={producto.id}>
                          <td className="tracking-number">{producto.sku}</td>
                          <td><strong>{producto.name}</strong>{producto.description && <small className="inventory-description">{producto.description}</small>}</td>
                          <td>{producto.stock_quantity} {producto.unit}</td>
                          <td>{producto.min_stock} {producto.unit}</td>
                          <td>{moneda(producto.unit_price)}</td>
                          <td><span className={`status-badge ${estado.clase}`}>{estado.texto}</span></td>
                          <td>
                            <div className="inventory-actions">
                              <button className="refresh-button" onClick={() => abrirEdicion(producto)} aria-label={`Editar ${producto.name}`}><Edit3 size={15} /></button>
                              <button className="refresh-button" onClick={() => cambiarEstado(producto)} aria-label={producto.is_active ? "Desactivar producto" : "Reactivar producto"}>{producto.is_active ? <Archive size={15} /> : <PackagePlus size={15} />}</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                <tr><td colSpan="7" className="empty-table">No hay productos para mostrar con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-footer">
          Mostrando {productosFiltrados.length} de {productos.length} productos
        </div>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="order-modal">
            <div className="modal-header">
              <div>
                <h2>{productoEditando ? "Editar producto" : "Agregar producto"}</h2>
                <p>Registra el artículo y sus existencias actuales.</p>
              </div>
              <button className="close-modal" onClick={() => setMostrarFormulario(false)} type="button">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={guardarProducto}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código SKU</label>
                  <input name="sku" value={formulario.sku} onChange={manejarCambio} placeholder="EJ. PROD-001" maxLength={40} required />
                </div>
                <div className="form-group">
                  <label>Nombre del producto</label>
                  <input name="name" value={formulario.name} onChange={manejarCambio} placeholder="Nombre del producto" maxLength={120} required />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción (opcional)</label>
                <input name="description" value={formulario.description} onChange={manejarCambio} placeholder="Detalles del producto" maxLength={1000} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unidad de medida</label>
                  <select name="unit" value={formulario.unit} onChange={manejarCambio}>
                    <option value="pieza">Pieza</option>
                    <option value="paquete">Paquete</option>
                    <option value="caja">Caja</option>
                    <option value="kg">Kilogramo</option>
                    <option value="litro">Litro</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio unitario (MXN)</label>
                  <input type="number" name="unit_price" min="0" step="0.01" value={formulario.unit_price} onChange={manejarCambio} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Existencias actuales</label>
                  <input type="number" name="stock_quantity" min="0" step="1" value={formulario.stock_quantity} onChange={manejarCambio} required />
                </div>
                <div className="form-group">
                  <label>Alerta de stock mínimo</label>
                  <input type="number" name="min_stock" min="0" step="1" value={formulario.min_stock} onChange={manejarCambio} required />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={guardando}>
                  {guardando ? "Guardando..." : productoEditando ? "Guardar cambios" : "Agregar al inventario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
