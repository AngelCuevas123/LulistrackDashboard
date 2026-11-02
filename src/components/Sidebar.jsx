
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPinned,
  Settings,
  LogOut,
  Box,
  ClipboardList
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-icon">
          <Box size={25} />
        </div>

        <div className="brand-info">
          <h2>Lulistrack</h2>
          <span>Delivery Management</span>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">GENERAL</span>

        <nav className="sidebar-nav">

          <NavLink to="/" end className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            <Package size={19} />
            <span>Pedidos</span>
          </NavLink>

          <NavLink to="/drivers" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            <Truck size={19} />
            <span>Repartidores</span>
          </NavLink>

          <NavLink to="/tracking" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            <MapPinned size={19} />
            <span>Seguimiento</span>
          </NavLink>

          <NavLink to="/history" className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }>
            <ClipboardList size={19} />
            <span>Historial</span>
          </NavLink>

        </nav>
      </div>

      <div className="sidebar-bottom">

        <span className="sidebar-label">CONFIGURACIÓN</span>

        <NavLink
  to="/settings"
  className={({ isActive }) =>
    isActive ? "nav-item active" : "nav-item"
  }
>
  <Settings size={19} />
  <span>Configuración</span>
</NavLink>

        <div className="sidebar-profile">
          <div className="profile-avatar">AC</div>

          <div className="profile-info">
            <strong>Administrador</strong>
            <span>Panel de control</span>
          </div>

          <LogOut
  size={18}
  className="logout-icon"
  onClick={onLogout}
  title="Cerrar sesión"
/>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;

