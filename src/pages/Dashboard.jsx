
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertTriangle,
  Warehouse
} from "lucide-react";

import StatCard from "../components/StatCard";
import OrderTable from "../components/OrderTable";

import { obtenerTodosLosPedidos, obtenerProductos } from "../services/api";

function Dashboard() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [productos, setProductos] = useState([]);
  const [errorInventario, setErrorInventario] = useState("");

  // Consultar pedidos desde el backend
  const cargarPedidos = useCallback(async (silencioso = false) => {

    try {

      if (silencioso) {
        setRefreshing(true);
      }

      setError("");

      const data = await obtenerTodosLosPedidos();

      setOrders(Array.isArray(data) ? data : []);

      setLastUpdated(new Date());

    } catch (error) {

      console.error("Error al cargar pedidos:", error);

      setError("No se pudieron cargar los pedidos. Intenta actualizar.");

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }, []);

  // Carga inicial y actualización automática
  useEffect(() => {

    cargarPedidos();

    const intervalo = setInterval(() => {
      cargarPedidos(true);
    }, 30000);

    return () => clearInterval(intervalo);

  }, [cargarPedidos]);

  const cargarInventario = useCallback(async () => {
    try {
      setErrorInventario("");
      const data = await obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      setErrorInventario("No se pudo consultar el inventario.");
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  // Calcular estadísticas reales
  const totalPedidos = orders.length;

  const entregados = orders.filter(
    order => order.status === "entregado"
  ).length;

  const pendientes = orders.filter(
    order => order.status === "pendiente"
  ).length;

  const enTransito = orders.filter(
    order => order.status === "en_transito"
  ).length;

  const productosCriticos = productos.filter((producto) =>
    producto.is_active &&
    (producto.stock_quantity === 0 ||
      (producto.min_stock > 0 && producto.stock_quantity <= producto.min_stock))
  );

  // Porcentaje de entregas completadas
  const porcentaje = totalPedidos > 0
    ? Math.round((entregados / totalPedidos) * 100)
    : 0;

  // Mostrar solamente los cinco pedidos recientes
  const pedidosRecientes = orders.slice(0, 5);

  return (

    <div className="dashboard">

      {/* Encabezado */}
      <div className="dashboard-heading orders-heading">

        <div>
          <span className="welcome-label">
            PANEL DE CONTROL
          </span>

          <h1>Dashboard</h1>

          <p>
            Bienvenido de nuevo. Aqui tienes el resumen de operaciones.
          </p>
        </div>

        <div className="dashboard-date">
          <Activity size={17} />
          Operaciones en tiempo real
        </div>

      </div>

      {/* Actualizacion */}
      <div className="dashboard-refresh">

        <span>
          {lastUpdated
            ? `Ultima actualizacion: ${lastUpdated.toLocaleTimeString("es-MX")}`
            : "Esperando datos del servidor..."}
        </span>

        <button
          className="refresh-button"
          onClick={() => cargarPedidos(true)}
          disabled={refreshing || loading}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "refresh-spinning" : ""}
          />

          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>

      </div>

      {/* Error de conexion */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Tarjetas de estadisticas */}
      <div className="stats-grid">

        <StatCard
          title="Total de pedidos"
          value={loading ? "..." : totalPedidos}
          description="Pedidos registrados"
          icon={Package}
          color="blue"
        />

        <StatCard
          title="Entregas completadas"
          value={loading ? "..." : entregados}
          description="Pedidos entregados"
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="En transito"
          value={loading ? "..." : enTransito}
          description="Pedidos en reparto"
          icon={Truck}
          color="purple"
        />

        <StatCard
          title="Pendientes"
          value={loading ? "..." : pendientes}
          description="Esperando asignacion"
          icon={Clock}
          color="yellow"
        />

      </div>

      {/* Resumen de operaciones */}
      <div className="dashboard-middle">

        <div className="performance-card">

          <div className="section-header">

            <div>
              <h3>Resumen de operaciones</h3>
              <p>Estado general de las entregas</p>
            </div>

            <TrendingUp size={21} color="#16A36A" />

          </div>

          <div className="performance-number">
            {loading ? "..." : `${porcentaje}%`}
          </div>

          <p className="performance-description">
            Porcentaje de pedidos completados
          </p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>

          <div className="progress-labels">
            <span>Entregas completadas</span>

            <strong>
              {entregados} de {totalPedidos}
            </strong>
          </div>

        </div>

        {/* Distribucion real de pedidos */}
        <div className="activity-card">

          <div className="section-header">
            <div>
              <h3>Estado de los pedidos</h3>
              <p>Distribucion actual de las operaciones</p>
            </div>
          </div>

          <div className="activity-item">

            <div className="activity-icon green">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>Entregados</strong>
              <p>{entregados} pedidos completados</p>
            </div>

          </div>

          <div className="activity-item">

            <div className="activity-icon blue">
              <Truck size={18} />
            </div>

            <div>
              <strong>En transito</strong>
              <p>{enTransito} pedidos en reparto</p>
            </div>

          </div>

          <div className="activity-item">

            <div className="activity-icon yellow">
              <Clock size={18} />
            </div>

            <div>
              <strong>Pendientes</strong>
              <p>{pendientes} pedidos por asignar</p>
            </div>

          </div>

          <div className="dashboard-status-chart">
            <div className="status-chart-heading">
              <strong>Distribución de pedidos</strong>
              <span>{totalPedidos} en total</span>
            </div>
            {[
              { label: "Entregados", value: entregados, color: "green" },
              { label: "En tránsito", value: enTransito, color: "blue" },
              { label: "Pendientes", value: pendientes, color: "yellow" }
            ].map((estado) => {
              const porcentajeEstado = totalPedidos > 0
                ? Math.round((estado.value / totalPedidos) * 100)
                : 0;
              return (
                <div className="status-chart-row" key={estado.label}>
                  <div className="status-chart-label">
                    <span>{estado.label}</span>
                    <strong>{estado.value} · {porcentajeEstado}%</strong>
                  </div>
                  <div className="status-chart-track">
                    <div
                      className={`status-chart-fill ${estado.color}`}
                      style={{ width: `${porcentajeEstado}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      <div className="orders-card inventory-dashboard-card">
        <div className="section-header">
          <div>
            <h3>Disponibilidad de inventario</h3>
            <p>Productos que requieren atención antes de registrar nuevos pedidos.</p>
          </div>
          <Link to="/inventory" className="view-all">
            Administrar inventario <Warehouse size={16} />
          </Link>
        </div>

        {errorInventario ? (
          <p className="empty-table">{errorInventario}</p>
        ) : productosCriticos.length > 0 ? (
          <div className="inventory-dashboard-list">
            {productosCriticos.slice(0, 4).map((producto) => (
              <div className="activity-item" key={producto.id}>
                <div className="activity-icon yellow">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <strong>{producto.name}</strong>
                  <p>
                    {producto.stock_quantity === 0
                      ? "Agotado"
                      : `Quedan ${producto.stock_quantity} ${producto.unit}; mínimo ${producto.min_stock}`}
                  </p>
                </div>
              </div>
            ))}
            {productosCriticos.length > 4 && (
              <p className="orders-footer">Y {productosCriticos.length - 4} producto(s) más requieren atención.</p>
            )}
          </div>
        ) : (
          <div className="activity-item">
            <div className="activity-icon green">
              <Package size={18} />
            </div>
            <div>
              <strong>Sin alertas de inventario</strong>
              <p>Los productos activos están por encima de su nivel mínimo.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de pedidos */}
      {loading ? (
        <div className="orders-card">
          <p className="empty-table">
            Cargando pedidos desde el servidor...
          </p>
        </div>
      ) : (
        <OrderTable orders={pedidosRecientes} />
      )}

    </div>

  );
}

export default Dashboard;
