
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Image,
  FileSignature,
  CalendarCheck
} from "lucide-react";

import {
  obtenerEntregasCompletadas,
  obtenerEvidencias
} from "../services/api";

function History() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [evidencias, setEvidencias] = useState(null);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);
  const [errorEvidencias, setErrorEvidencias] = useState("");

  // Cargar pedidos completados
  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerEntregasCompletadas();

      setPedidos(Array.isArray(datos) ? datos : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Consultar evidencias del pedido seleccionado
  const verEvidencias = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setEvidencias(null);
    setErrorEvidencias("");
    setCargandoEvidencias(true);

    try {
      const datos = await obtenerEvidencias(pedido.id);

      setEvidencias(datos);

    } catch (err) {
      setErrorEvidencias(err.message);
    } finally {
      setCargandoEvidencias(false);
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = busqueda.toLowerCase();

    return (
      pedido.tracking_number?.toLowerCase().includes(texto) ||
      pedido.client_name?.toLowerCase().includes(texto) ||
      pedido.address?.toLowerCase().includes(texto)
    );
  });

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha registrada";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <div className="history-page">

      <div className="dashboard-heading">
        <div>
          <h1>Historial de entregas</h1>
          <p>Consulta los pedidos completados y sus evidencias.</p>
        </div>

        <button
          className="refresh-button"
          onClick={cargarHistorial}
          disabled={cargando}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div className="history-summary">
        <div className="history-summary-icon">
          <CalendarCheck size={25} />
        </div>

        <div>
          <span>Entregas completadas</span>
          <h2>{pedidos.length}</h2>
        </div>
      </div>

      <div className="orders-card">

        <div className="history-toolbar">
          <div>
            <h3>Entregas registradas</h3>
            <p>Consulta la información y los comprobantes.</p>
          </div>

          <div className="orders-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar pedido, cliente o dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {cargando ? (
          <div className="empty-table">
            Cargando historial...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="empty-table">
            No se encontraron entregas.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Seguimiento</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Evidencias</th>
                </tr>
              </thead>

              <tbody>
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <strong>{pedido.tracking_number}</strong>
                    </td>

                    <td>{pedido.client_name}</td>

                    <td>{pedido.address}</td>

                    <td>
                      <span className="status-badge entregado">
                        Entregado
                      </span>
                    </td>

                    <td>
                      <button
                        className="evidence-button"
                        onClick={() => verEvidencias(pedido)}
                      >
                        <Eye size={16} />
                        Ver evidencias
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de evidencias */}
      {pedidoSeleccionado && (
        <div className="modal-overlay">
          <div className="evidence-modal">

            <div className="modal-header">
              <div>
                <h2>Evidencias de entrega</h2>
                <p>
                  Pedido #{pedidoSeleccionado.tracking_number}
                </p>
              </div>

              <button
                className="close-modal"
                onClick={() => {
                  setPedidoSeleccionado(null);
                  setEvidencias(null);
                  setErrorEvidencias("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            {cargandoEvidencias ? (
              <div className="empty-table">
                Cargando evidencias...
              </div>
            ) : errorEvidencias ? (
              <div className="error-message">
                {errorEvidencias}
              </div>
            ) : evidencias ? (
              <>
                <div className="evidence-date">
                  <CalendarCheck size={17} />
                  <span>
                    Entregado: {formatearFecha(evidencias.proof_timestamp)}
                  </span>
                </div>

                <div className="evidence-grid">

                  <div className="evidence-preview">
                    <h3>
                      <Image size={18} />
                      Fotografía de entrega
                    </h3>

                    {evidencias.photo_url ? (
                      <a
                        href={evidencias.photo_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={evidencias.photo_url}
                          alt="Fotografía de entrega"
                        />
                      </a>
                    ) : (
                      <p>No hay fotografía registrada.</p>
                    )}
                  </div>

                  <div className="evidence-preview">
                    <h3>
                      <FileSignature size={18} />
                      Firma del cliente
                    </h3>

                    {evidencias.signature_url ? (
                      <a
                        href={evidencias.signature_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={evidencias.signature_url}
                          alt="Firma del cliente"
                        />
                      </a>
                    ) : (
                      <p>No hay firma registrada.</p>
                    )}
                  </div>

                </div>
              </>
            ) : null}

            <div className="evidence-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setPedidoSeleccionado(null);
                  setEvidencias(null);
                  setErrorEvidencias("");
                }}
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default History;
