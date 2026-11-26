
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

// Inventario del negocio
export async function obtenerProductos(incluirInactivos = false) {
  const parametro = incluirInactivos ? "?include_inactive=true" : "";
  return solicitar(`/inventory/products${parametro}`);
}

export async function crearProducto(datos) {
  return solicitar("/inventory/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
}

export async function actualizarProducto(productId, datos) {
  return solicitar(`/inventory/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
}

export async function desactivarProducto(productId) {
  return solicitar(`/inventory/products/${encodeURIComponent(productId)}`, {
    method: "DELETE"
  });
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

// Consultar seguimiento publico sin requerir una sesion administrativa
export async function consultarSeguimientoPublico(numeroGuia) {
  let respuesta;

  try {
    respuesta = await fetch(
      `${API_URL}/orders/track/${encodeURIComponent(numeroGuia.trim())}`
    );
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.");
    }
    throw error;
  }

  if (!respuesta.ok) {
    const mensaje = await obtenerMensajeError(
      respuesta,
      respuesta.status === 404
        ? "No encontramos un pedido con ese numero de guia."
        : "No fue posible consultar el seguimiento."
    );
    throw new Error(mensaje);
  }

  return respuesta.json();
}

// Actualizar la prioridad de un pedido (solo administrador)
export async function actualizarPrioridad(orderId, isPriority) {
  return solicitar(`/orders/${encodeURIComponent(orderId)}/priority`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_priority: isPriority })
  });
}


// Consultar localidades asociadas a un código postal mexicano
export async function buscarCodigoPostal(codigoPostal) {
  return solicitar(`/addresses/postal-codes/${encodeURIComponent(codigoPostal)}`);
}

// Buscar calles, caminos y asentamientos con contexto geográfico
export async function buscarDirecciones({ q, postal_code, locality, municipality, state }) {
  const params = new URLSearchParams({ q });
  if (postal_code) params.set("postal_code", postal_code);
  if (locality) params.set("locality", locality);
  if (municipality) params.set("municipality", municipality);
  if (state) params.set("state", state);
  return solicitar(`/addresses/search?${params.toString()}`);
}
