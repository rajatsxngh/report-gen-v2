function ReportList({ reports, onDownload, onSendEmail }) {
  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <h3>No reports yet</h3>
        <p>Click "Generate Report" to create your first report.</p>
      </div>
    );
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString();
  }

  function badgeClass(status) {
    if (status === 'success') return 'badge badge-success';
    if (status === 'failure') return 'badge badge-failure';
    return 'badge badge-pending';
  }

  return (
    <div className="reports-table-wrapper">
      <table className="reports-table">
        <thead>
          <tr>
            <th>Template</th>
            <th>Dataset</th>
            <th>Status</th>
            <th>Generated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.template_name || 'Unknown'}</td>
              <td>{report.dataset_name || 'Unknown'}</td>
              <td>
                <span className={badgeClass(report.status)}>{report.status}</span>
              </td>
              <td>{formatDate(report.created_at)}</td>
              <td className="actions">
                <button
                  className="btn btn-sm btn-download"
                  onClick={() => onDownload(report)}
                  disabled={report.status !== 'success'}
                >
                  Download
                </button>
                <button
                  className="btn btn-sm btn-email"
                  onClick={() => onSendEmail(report)}
                  disabled={report.status !== 'success'}
                >
                  Send Email
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportList;
