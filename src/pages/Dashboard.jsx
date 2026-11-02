
import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";

import StatCard from "../components/StatCard";
import OrderTable from "../components/OrderTable";

function Dashboard() {

  // Datos temporales para construir la interfaz.
  // Despues los conectaremos con nuestra API.

  const orders = [
    {
      id: "ord-001",
      tracking_number: "LUL-2026-001",
      client_name: "Carlos Ramirez",
      address: "Centro, Guanajuato",
      status: "en_transito",
      estimated_time: "14:30"
    },
    {
      id: "ord-002",
      tracking_number: "LUL-2026-002",
      client_name: "Maria Gonzalez",
      address: "San Miguel, Guanajuato",
      status: "pendiente",
      estimated_time: "15:00"
    },
    {
      id: "ord-003",
      tracking_number: "LUL-2026-003",
      client_name: "Jose Hernandez",
      address: "Zona Norte, Guanajuato",
      status: "entregado",
      estimated_time: "12:45"
    }
  ];

  return (
    <div className="dashboard">

     <div className="dashboard-heading orders-heading">
        <div>
          <span className="welcome-label">PANEL DE CONTROL</span>
          <h1>Dashboard</h1>
          <p>Bienvenido de nuevo. Aqui tienes el resumen de operaciones.</p>
        </div>

        <div className="dashboard-date">
          <Activity size={17} />
          Operaciones en tiempo real
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          title="Total de pedidos"
          value="128"
          description="Pedidos registrados"
          icon={Package}
          color="blue"
        />

        <StatCard
          title="Entregas completadas"
          value="86"
          description="Pedidos entregados"
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="En transito"
          value="29"
          description="Pedidos en reparto"
          icon={Truck}
          color="purple"
        />

        <StatCard
          title="Pendientes"
          value="13"
          description="Esperando asignacion"
          icon={Clock}
          color="yellow"
        />

      </div>

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
            67.2%
          </div>

          <p className="performance-description">
            Porcentaje de pedidos completados
          </p>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <div className="progress-labels">
            <span>Entregas completadas</span>
            <strong>86 de 128</strong>
          </div>
        </div>

        <div className="activity-card">
          <div className="section-header">
            <div>
              <h3>Actividad reciente</h3>
              <p>Movimientos de la operacion</p>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon green">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>Entrega completada</strong>
              <p>Pedido LUL-2026-003</p>
              <span>Hace 10 minutos</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon blue">
              <Truck size={18} />
            </div>

            <div>
              <strong>Pedido en reparto</strong>
              <p>Pedido LUL-2026-001</p>
              <span>Hace 25 minutos</span>
            </div>
          </div>
        </div>

      </div>

      <OrderTable orders={orders} />

    </div>
  );
}

export default Dashboard;
