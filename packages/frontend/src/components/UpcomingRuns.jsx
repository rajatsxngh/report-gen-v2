import { computeNextRunDate } from '../utils/scheduleUtils';

function UpcomingRuns({ schedules, templates }) {
  function getTemplateName(id) {
    const t = templates.find((t) => t.id === id);
    return t ? t.name : `Template #${id}`;
  }

  const enabledSchedules = schedules.filter((s) => s.enabled);

  const upcoming = enabledSchedules
    .map((s) => ({
      schedule: s,
      nextRun: computeNextRunDate(s),
    }))
    .filter((item) => item.nextRun !== null)
    .sort((a, b) => a.nextRun - b.nextRun)
    .slice(0, 10);

  if (upcoming.length === 0) {
    return (
      <div className="upcoming-runs">
        <h3>Upcoming Runs</h3>
        <p className="empty-message">No upcoming runs scheduled.</p>
      </div>
    );
  }

  return (
    <div className="upcoming-runs">
      <h3>Upcoming Runs</h3>
      <ul className="upcoming-list">
        {upcoming.map((item, i) => (
          <li key={`${item.schedule.id}-${i}`} className="upcoming-item">
            <span className="upcoming-template">
              {getTemplateName(item.schedule.template_id)}
            </span>
            <span className="upcoming-freq">{item.schedule.frequency}</span>
            <span className="upcoming-time">
              {item.nextRun.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UpcomingRuns;
