
import { supabase } from "./supabase";

const API_URL = "https://backendlulistrack.onrender.com";

// Obtener el token de la sesion actual
async function obtenerHeaders() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw new Error("No hay una sesion activa. Inicia sesion nuevamente.");
  }

  return {
    Authorization: `Bearer ${data.session.access_token}`
  };
}

// Convertir errores del backend en mensajes legibles
async function obtenerMensajeError(respuesta, mensajePredeterminado) {
  try {
    const contenido = await respuesta.json();
    const detalle = contenido.detail || contenido.message || contenido.error;

    if (typeof detalle === "string") {
      return detalle;
    }

    if (Array.isArray(detalle)) {
      return detalle.map((error) => {
        if (typeof error === "string") return error;

        const campo = Array.isArray(error.loc)
          ? error.loc.join(".")
          : "Dato";

        return `${campo}: ${error.msg || JSON.stringify(error)}`;
      }).join(" | ");
    }

    if (detalle && typeof detalle === "object") {
      return JSON.stringify(detalle);
    }

    return mensajePredeterminado;
  } catch {
    return mensajePredeterminado;
  }
}

// Funcion general para comunicarse con el backend
async function solicitar(endpoint, opciones = {}) {
  let respuesta;

  try {
    const headers = await obtenerHeaders();

    respuesta = await fetch(`${API_URL}${endpoint}`, {
      ...opciones,
      headers: {
        ...headers,
        ...opciones.headers
      }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor.");
    }

    throw error;
  }

  if (!respuesta.ok) {
    const mensaje = await obtenerMensajeError(
      respuesta,
      `Error ${respuesta.status}: ${respuesta.statusText}`
    );

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}

// Obtener pedidos
export async function obtenerPedidos() {
  return solicitar("/orders/");
}

// Registrar un pedido
export async function crearPedido(datos) {
  return solicitar("/orders/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });
}

// Obtener pedidos activos y completados
export async function obtenerTodosLosPedidos() {
  return solicitar("/orders/");
}

// Obtener evidencias de una entrega
export async function obtenerEvidencias(orderId) {
  return solicitar(
    `/orders/${encodeURIComponent(orderId)}/evidence`
  );
}

// Obtener todos los repartidores
export async function obtenerRepartidores() {
  return solicitar("/drivers/");
}

// Registrar un nuevo repartidor
export async function crearRepartidor(datos) {
  return solicitar("/drivers/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });
}

// Asignar un pedido a un repartidor
export async function asignarPedido(orderId, driverId) {
  return solicitar(
    `/orders/${encodeURIComponent(orderId)}/assign`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        driver_id: driverId
      })
    }
  );
}
// Obtener historial de entregas completadas
export async function obtenerEntregasCompletadas() {
  return solicitar("/orders/completed");
}