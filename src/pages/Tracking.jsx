
import { useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  Truck,
  AlertCircle
} from "lucide-react";

import { obtenerTodosLosPedidos } from "../services/api";

function Tracking() {
  const [busqueda, setBusqueda] = useState("");
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function buscarPedido(e) {
    e.preventDefault();

    if (!busqueda.trim()) {
      setError("Escribe un numero de seguimiento o nombre de cliente.");
      setPedido(null);
      return;
    }

    try {
      setCargando(true);
      setError("");
      setPedido(null);

      const pedidos = await obtenerTodosLosPedidos();

      const resultado = pedidos.find((p) =>
        (p.tracking_number || "").toLowerCase() === busqueda.trim().toLowerCase()
      ) || pedidos.find((p) =>
        (p.client_name || "").toLowerCase().includes(busqueda.trim().toLowerCase())
      );

      if (!resultado) {
        setError("No encontramos ningun pedido con esos datos.");
      } else {
        setPedido(resultado);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const estados = [
    { id: "pendiente", label: "Pedido registrado", icon: Package },
    { id: "en_transito", label: "En camino", icon: Truck },
    { id: "entregado", label: "Pedido entregado", icon: CheckCircle2 }
  ];

  const estadoActual = pedido?.status || "pendiente";

  const indiceEstado = estados.findIndex(
    (estado) => estado.id === estadoActual
  );

  return (
    <div className="tracking-page">

      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">LOCALIZACION DE ENVIOS</span>
          <h1>Seguimiento</h1>
          <p>Consulta el estado y la informacion de tus entregas.</p>
        </div>
      </div>

      <div className="tracking-search-card">
        <div className="tracking-search-icon">
          <Package size={27} />
        </div>

        <h2>¿Donde esta tu pedido?</h2>
        <p>Busca por numero de seguimiento o nombre del cliente.</p>

        <form onSubmit={buscarPedido} className="tracking-form">
          <div className="tracking-input">
            <Search size={20} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej. LUL-2026-001 o Carlos Ramirez"
            />
          </div>

          <button className="primary-button" disabled={cargando}>
            {cargando ? "Buscando..." : "Buscar pedido"}
          </button>
        </form>

        {error && (
          <div className="tracking-error">
            <AlertCircle size={17} />
            {error}
          </div>
        )}
      </div>

      {pedido && (
        <div className="tracking-result">

          <div className="tracking-result-header">
            <div>
              <span className="eyebrow">RESULTADO DE BUSQUEDA</span>
              <h2>{pedido.tracking_number}</h2>
              <p>Pedido de {pedido.client_name}</p>
            </div>

            <span className={`status-badge ${pedido.status}`}>
              {(pedido.status || "").replaceAll("_", " ")}
            </span>
          </div>

          <div className="tracking-details">

            <div className="tracking-detail">
              <User size={20} />
              <div>
                <span>Cliente</span>
                <strong>{pedido.client_name}</strong>
              </div>
            </div>

            <div className="tracking-detail">
              <MapPin size={20} />
              <div>
                <span>Direccion</span>
                <strong>{pedido.address}, {pedido.colony}</strong>
              </div>
            </div>

            <div className="tracking-detail">
              <Clock size={20} />
              <div>
                <span>Entrega estimada</span>
                <strong>{pedido.estimated_time || "Sin definir"}</strong>
              </div>
            </div>

            <div className="tracking-detail">
              <Package size={20} />
              <div>
                <span>Repartidor asignado</span>
                <strong>
                  {pedido.driver_id || "Pendiente de asignacion"}
                </strong>
              </div>
            </div>

          </div>

          <div className="tracking-timeline">
            <h3>Estado del envio</h3>

            {estados.map((estado, index) => {
              const Icon = estado.icon;
              const completado =
                indiceEstado >= 0 && index <= indiceEstado;

              return (
                <div className="timeline-item" key={estado.id}>
                  <div className={`timeline-icon ${completado ? "completed" : ""}`}>
                    <Icon size={19} />
                  </div>

                  <div>
                    <strong>{estado.label}</strong>
                    <p>
                      {completado
                        ? "Etapa alcanzada"
                        : "Etapa pendiente"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {pedido.latitude != null && pedido.longitude != null ? (
            <div className="tracking-location">
              <MapPin size={19} />
              <div>
                <strong>Coordenadas de entrega</strong>
                <p>
                  {pedido.latitude}, {pedido.longitude}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${pedido.latitude},${pedido.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver ubicacion en Google Maps
                </a>
              </div>
            </div>
          ) : (
            <p className="tracking-no-location">
              Este pedido aun no tiene coordenadas registradas.
            </p>
          )}

        </div>
      )}

    </div>
  );
}

export default Tracking;
