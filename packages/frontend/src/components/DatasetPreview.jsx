function DatasetPreview({ dataset }) {
  if (!dataset) {
    return (
      <div className="dataset-preview">
        <h2>Preview</h2>
        <p className="empty-state">Select a dataset to preview its data.</p>
      </div>
    );
  }

  const previewRows = dataset.data.slice(0, 10);
  const fields =
    dataset.fields ||
    (previewRows.length > 0 ? Object.keys(previewRows[0]) : []);

  return (
    <div className="dataset-preview">
      <h2>Preview &mdash; {dataset.name}</h2>
      <p className="preview-info">
        Showing {previewRows.length} of {dataset.rowCount} rows
      </p>
      <div className="preview-table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i}>
                {fields.map((f) => (
                  <td key={f}>{row[f]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DatasetPreview;
