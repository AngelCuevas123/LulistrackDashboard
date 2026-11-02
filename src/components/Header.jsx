
  import { Search, Bell, ChevronDown } from "lucide-react";

  function Header() {
    return (
      <header className="header">

        <div className="header-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar pedidos, repartidores..."
          />

          <span className="search-shortcut">⌘ K</span>
        </div>

        <div className="header-actions">

          <button className="notification-button">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>

          <div className="header-divider"></div>

          <div className="header-user">
            <div className="user-avatar">AC</div>

            <div className="header-user-info">
              <strong>Administrador</strong>
              <span>Super Admin</span>
            </div>

            <ChevronDown size={17} />
          </div>

        </div>

      </header>
    );
  }

  export default Header;
