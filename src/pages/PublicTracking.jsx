import { useEffect, useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { consultarSeguimientoPublico } from "../services/api";

const etapas = [
  { id: "pendiente", label: "Pedido registrado", description: "El pedido fue registrado en el sistema.", icon: Package },
  { id: "en_transito", label: "En camino", description: "El pedido se encuentra en proceso de entrega.", icon: Truck },
  { id: "entregado", label: "Entregado", description: "El pedido fue entregado correctamente.", icon: CheckCircle2 }
];

function formatearFecha(fecha) {
  if (!fecha) return null;
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) return null;

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(fechaValida);
}

function PublicTracking() {
  const [numeroGuia, setNumeroGuia] = useState("");
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function buscarPedido(evento) {
    evento.preventDefault();

    if (!numeroGuia.trim()) {
      setPedido(null);
      setError("Ingresa tu numero de guia para consultar el pedido.");
      return;
    }

    setCargando(true);
    setError("");
    setPedido(null);

    try {
      const resultado = await consultarSeguimientoPublico(numeroGuia);
      setPedido(resultado);
    } catch (err) {
      setError(err.message || "Ocurrio un error al consultar tu pedido.");
    } finally {
      setCargando(false);
    }
  }


  // Actualizar el seguimiento mientras el pedido siga en tránsito.
  useEffect(() => {
    if (!pedido?.tracking_number || pedido.status !== "en_transito") {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const actualizado = await consultarSeguimientoPublico(
          pedido.tracking_number
        );
        setPedido(actualizado);
      } catch {
        // Se conserva la última ubicación válida si hay un corte temporal.
      }
    }, 15000);

    return () => window.clearInterval(interval);
  }, [pedido?.tracking_number, pedido?.status]);

  const estado = (pedido?.status || "pendiente").toLowerCase();
  const indiceActual = etapas.findIndex((etapa) => etapa.id === estado);
  const fechaEntrega = formatearFecha(pedido?.proof_timestamp);
  const entregado = estado === "entregado";

  return (
    <main className="public-tracking-page">
      <header className="public-tracking-header">
        <a className="public-tracking-brand" href="/seguimiento" aria-label="Lulistrack inicio">
          <span className="public-tracking-brand-icon"><Package size={22} /></span>
          <span>Luli<span>track</span></span>
        </a>
        <span className="public-tracking-secure"><ShieldCheck size={16} /> Seguimiento seguro</span>
      </header>

      <section className="public-tracking-content">
        <div className="public-tracking-intro">
          <span className="public-tracking-eyebrow">SEGUIMIENTO DE PEDIDOS</span>
          <h1>Tu pedido, siempre <span>en camino.</span></h1>
          <p>Consulta el estado de tu entrega con el numero de guia que te compartio el comercio.</p>
        </div>

        <section className="public-tracking-search-card">
          <div className="public-tracking-search-icon"><Package size={25} /></div>
          <h2>Rastrea tu pedido</h2>
          <p>Escribe tu numero de guia para conocer su estado actual.</p>

          <form className="public-tracking-form" onSubmit={buscarPedido}>
            <label htmlFor="tracking-number">Numero de guia</label>
            <div className="public-tracking-input-wrap">
              <Search size={19} />
              <input
                id="tracking-number"
                type="text"
                value={numeroGuia}
                onChange={(evento) => setNumeroGuia(evento.target.value)}
                placeholder="Ej. LUL-2026-001"
                autoComplete="off"
                aria-describedby={error ? "tracking-error" : undefined}
              />
            </div>
            <button type="submit" disabled={cargando}>
              {cargando ? "Consultando..." : "Consultar pedido"}
            </button>
          </form>

          {error && (
            <div className="public-tracking-error" id="tracking-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </section>

        {pedido && (
          <section className="public-tracking-result" aria-live="polite">
            <div className="public-tracking-result-top">
              <div>
                <span className="public-tracking-eyebrow">NUMERO DE GUIA</span>
                <h2>{pedido.tracking_number}</h2>
              </div>
              <span className={`public-tracking-status ${estado}`}>
                {estado.replaceAll("_", " ")}
              </span>
            </div>

            <div className="public-tracking-estimate">
              <Clock3 size={20} />
              <div>
                <span>{entregado ? "Entrega confirmada" : "Tiempo estimado de entrega"}</span>
                <strong>{entregado && fechaEntrega ? fechaEntrega : pedido.estimated_time || "Por confirmar"}</strong>
              </div>
            </div>

            <div className="public-tracking-progress">
              <h3>Progreso de tu pedido</h3>
              <div className="public-tracking-steps">
                {etapas.map((etapa, indice) => {
                  const Icono = etapa.icon;
                  const completada = indiceActual >= 0 && indice <= indiceActual;

                  return (
                    <div className={`public-tracking-step ${completada ? "completed" : ""}`} key={etapa.id}>
                      <div className="public-tracking-step-icon"><Icono size={19} /></div>
                      <div className="public-tracking-step-copy">
                        <strong>{etapa.label}</strong>
                        <span>{completada ? etapa.description : "Esta etapa aun no se completa."}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {estado === "en_transito" && pedido.current_location && (
              <section className="public-tracking-map">
                <div className="public-tracking-map-heading">
                  <div>
                    <span className="public-tracking-eyebrow">UBICACIÓN ACTUAL</span>
                    <h3>Tu repartidor está en camino</h3>
                    <p>
                      Última actualización: {formatearFecha(pedido.current_location.updated_at) || "hace unos momentos"}
                    </p>
                  </div>
                  <span className="public-tracking-live-dot" aria-label="Ubicación disponible" />
                </div>
                <iframe
                  title="Ubicación actual del repartidor"
                  src={`https://maps.google.com/maps?q=${pedido.current_location.latitude},${pedido.current_location.longitude}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span className="public-tracking-map-note">
                  La ubicación se actualiza automáticamente mientras el repartidor comparte su recorrido.
                </span>
              </section>
            )}

            {estado === "en_transito" && !pedido.current_location && (
              <div className="public-tracking-location-wait">
                <Truck size={19} />
                <span>El pedido está en camino. La ubicación del repartidor aparecerá cuando se reciba su primera señal GPS.</span>
              </div>
            )}

            {entregado && (
              <div className="public-tracking-delivered">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Tu pedido ha sido entregado</strong>
                  <span>{fechaEntrega ? `Entrega registrada el ${fechaEntrega}.` : "El comercio registro la entrega de tu pedido."}</span>
                </div>
              </div>
            )}

            <p className="public-tracking-privacy">
              <ShieldCheck size={15} />
              Por seguridad, aqui solo mostramos informacion general del seguimiento.
            </p>
          </section>
        )}
      </section>

      <footer className="public-tracking-footer">
        <span>Lulistrack</span>
        <span>Seguimiento de entregas</span>
      </footer>
    </main>
  );
}

export default PublicTracking;
