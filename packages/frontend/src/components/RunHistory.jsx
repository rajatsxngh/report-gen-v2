function RunHistory({ runs, scheduleName, onClose }) {
  return (
    <div className="run-history">
      <div className="run-history-header">
        <h3>Run History {scheduleName && <span>— {scheduleName}</span>}</h3>
        <button className="btn btn-sm btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      {runs.length === 0 ? (
        <p className="empty-message">No runs recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>
                  {new Date(run.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td>
                  <span className={`status-badge status-${run.status}`}>
                    {run.status}
                  </span>
                </td>
                <td className="error-cell">{run.error || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RunHistory;
