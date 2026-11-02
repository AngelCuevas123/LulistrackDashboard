
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
                    {order.tracking_number}
                  </td>

                  <td>{order.client_name}</td>

                  <td>{order.address}</td>

                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>

                  <td>{order.estimated_time}</td>
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
