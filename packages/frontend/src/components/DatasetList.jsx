function DatasetList({ datasets, selectedId, onSelect }) {
  return (
    <div className="dataset-list">
      <h2>Datasets</h2>
      <div className="dataset-cards">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className={`dataset-card${selectedId === ds.id ? ' selected' : ''}`}
            onClick={() => onSelect(ds)}
          >
            <h3 className="dataset-card-name">{ds.name}</h3>
            <p className="dataset-card-desc">{ds.description}</p>
            <div className="dataset-card-meta">
              <span>{ds.rowCount} rows</span>
              <span>{ds.fields.length} fields</span>
            </div>
          </div>
        ))}
        {datasets.length === 0 && (
          <p className="empty-state">No datasets available.</p>
        )}
      </div>
    </div>
  );
}

export default DatasetList;
