import './Dashboard.css';

const statItems = [
  { key: 'template_count', label: 'Total Templates' },
  { key: 'active_schedules', label: 'Active Schedules' },
  { key: 'reports_this_week', label: 'Reports This Week' },
  { key: 'failed_this_week', label: 'Failed This Week' },
];

function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      {statItems.map((item) => (
        <div
          key={item.key}
          className={`stat-card${item.key === 'failed_this_week' && stats[item.key] > 0 ? ' stat-card--danger' : ''}`}
        >
          <span className="stat-value">{stats[item.key]}</span>
          <span className="stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
