import './Dashboard.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReportCard({ template, onRunNow, onEdit, onDelete }) {
  const { schedule, last_run } = template;

  return (
    <div className="report-card">
      <div className="report-card__header">
        <h3 className="report-card__title">{template.name}</h3>
        {last_run && (
          <span
            className={`report-card__status report-card__status--${last_run.status}`}
          >
            {last_run.status}
          </span>
        )}
      </div>

      {template.description && (
        <p className="report-card__desc">{template.description}</p>
      )}

      <div className="report-card__meta">
        {schedule ? (
          <span className="report-card__schedule">
            {schedule.frequency} at {schedule.time}
            {!schedule.enabled && ' (paused)'}
          </span>
        ) : (
          <span className="report-card__schedule report-card__schedule--none">
            No schedule
          </span>
        )}
        {last_run && (
          <span className="report-card__last-run">
            Last run: {formatDate(last_run.created_at)}
          </span>
        )}
      </div>

      <div className="report-card__actions">
        <button className="btn btn--primary" onClick={() => onRunNow(template)}>
          Run Now
        </button>
        <button className="btn btn--secondary" onClick={() => onEdit(template)}>
          Edit
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(template)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default ReportCard;
