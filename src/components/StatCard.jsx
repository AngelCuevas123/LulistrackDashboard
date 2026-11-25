import { Activity } from "lucide-react";

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <article className={`stat-card glass-stat-card ${color || ""}`}>
      <div className="stat-card-top">
        <span>{title}</span>
        <div className={`stat-icon ${color || ""}`}>
          <Icon size={21} />
        </div>
      </div>

      <h2>{value}</h2>

      <div className="stat-card-bottom">
        <span className="stat-live-indicator"><Activity size={13} /> Dato del servidor</span>
        <p>{description}</p>
      </div>
      <span className="stat-card-accent" aria-hidden="true" />
    </article>
  );
}

export default StatCard;
