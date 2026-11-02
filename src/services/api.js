
const API_URL = "https://backendlulistrack.onrender.com";

// Obtener pedidos
export async function obtenerPedidos() {
  const respuesta = await fetch(`${API_URL}/orders/`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener los pedidos");
  }

  return await respuesta.json();
}

// Registrar un pedido
export async function crearPedido(datos) {
  const respuesta = await fetch(`${API_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const error = await respuesta.text();
    throw new Error(error || "No se pudo registrar el pedido");
  }

  return await respuesta.json();
}

// Obtener pedidos activos y completados para seguimiento
export async function obtenerTodosLosPedidos() {
  const [activos, completados] = await Promise.all([
    fetch(`${API_URL}/orders/`),
    fetch(`${API_URL}/orders/completed`)
  ]);

  if (!activos.ok || !completados.ok) {
    throw new Error("No se pudieron consultar los pedidos");
  }

  const pedidosActivos = await activos.json();
  const pedidosCompletados = await completados.json();

  return [...pedidosActivos, ...pedidosCompletados];
}

// Obtener evidencias de una entrega
export async function obtenerEvidencias(orderId) {
  const respuesta = await fetch(
    `${API_URL}/orders/${encodeURIComponent(orderId)}/evidence`
  );

  if (!respuesta.ok) {
    let mensaje = "No se pudieron consultar las evidencias";

    try {
      const error = await respuesta.json();
      mensaje = error.detail || mensaje;
    } catch {}

    throw new Error(mensaje);
  }

  return await respuesta.json();
}
