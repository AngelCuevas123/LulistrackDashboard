
import { useState, useEffect, useCallback } from "react";

import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw
} from "lucide-react";

import StatCard from "../components/StatCard";
import OrderTable from "../components/OrderTable";

import { obtenerTodosLosPedidos } from "../services/api";

function Dashboard() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

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

        </div>

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
