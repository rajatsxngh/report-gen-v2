import { getNextRun } from '../utils/scheduleUtils';

function ScheduleList({
  schedules,
  templates,
  datasets,
  onEdit,
  onDelete,
  onToggle,
  onViewHistory,
}) {
  function getTemplateName(id) {
    const t = templates.find((t) => t.id === id);
    return t ? t.name : `Template #${id}`;
  }

  function getDatasetName(id) {
    const d = datasets.find((d) => d.id === id);
    return d ? d.name : `Dataset #${id}`;
  }

  function formatFrequency(schedule) {
    if (schedule.frequency === 'daily') return 'Daily';
    if (schedule.frequency === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Weekly (${days[schedule.day_of_week ?? 0]})`;
    }
    if (schedule.frequency === 'monthly') {
      return `Monthly (day ${schedule.day_of_month ?? 1})`;
    }
    return schedule.frequency;
  }

  if (schedules.length === 0) {
    return (
      <div className="schedule-list-empty">
        <p>No schedules yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="schedule-list">
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Dataset</th>
            <th>Frequency</th>
            <th>Time</th>
            <th>Next Run</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id} className={!s.enabled ? 'row-disabled' : ''}>
              <td>{getTemplateName(s.template_id)}</td>
              <td>{getDatasetName(s.dataset_id)}</td>
              <td>{formatFrequency(s)}</td>
              <td>{s.time}</td>
              <td>{s.enabled ? getNextRun(s) : '--'}</td>
              <td>
                <button
                  className={`toggle-btn ${s.enabled ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => onToggle(s)}
                  title={s.enabled ? 'Disable' : 'Enable'}
                >
                  {s.enabled ? 'On' : 'Off'}
                </button>
              </td>
              <td className="actions-cell">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onViewHistory(s)}
                >
                  History
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEdit(s)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(s)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleList;
