import { ArrowUpRight } from "lucide-react";

function OrderTable({ orders = [] }) {
  return (
    <div className="orders-card">
      <div className="section-header">
        <div>
          <h3>Pedidos recientes</h3>
          <p>Seguimiento de las ultimas operaciones</p>
        </div>

        <a href="/orders" className="view-all">
          Ver todos <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Direccion</th>
              <th>Estado</th>
              <th>Entrega</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="tracking-number">
                    {order.tracking_number || "Sin numero"}
                  </td>

                  <td>{order.client_name || "Sin cliente"}</td>

                  <td>
                    {order.address || "Sin direccion"}
                    {order.colony && `, ${order.colony}`}
                  </td>

                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {(order.status || "sin estado").replaceAll("_", " ")}
                    </span>
                  </td>

                  <td>{order.estimated_time || "--:--"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-table">
                  No hay pedidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;
