import { useState, useEffect } from 'react';
import api from '../api';
import DatasetList from '../components/DatasetList';
import DatasetPreview from '../components/DatasetPreview';
import FieldBindingPanel from '../components/FieldBindingPanel';
import './DataConnector.css';

function DataConnector() {
  const [datasets, setDatasets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [bindings, setBindings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ds, ts] = await Promise.all([
          api.get('/datasets'),
          api.get('/templates'),
        ]);
        setDatasets(ds);
        setTemplates(ts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSelectDataset(ds) {
    try {
      const full = await api.get(`/datasets/${ds.id}`);
      setSelectedDataset(full);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSelectTemplate(e) {
    const t = templates.find((t) => t.id === Number(e.target.value));
    setSelectedTemplate(t || null);
    setBindings({});
  }

  if (loading) return <div className="dc-loading">Loading...</div>;
  if (error) return <div className="dc-error">Error: {error}</div>;

  return (
    <div className="data-connector">
      <h1>Data Connector</h1>
      <div className="dc-layout">
        <div className="dc-sidebar">
          <DatasetList
            datasets={datasets}
            selectedId={selectedDataset?.id}
            onSelect={handleSelectDataset}
          />
          {templates.length > 0 && (
            <div className="template-select">
              <h2>Template</h2>
              <select
                value={selectedTemplate?.id || ''}
                onChange={handleSelectTemplate}
              >
                <option value="">— select template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="dc-main">
          <DatasetPreview dataset={selectedDataset} />
          <FieldBindingPanel
            template={selectedTemplate}
            dataset={selectedDataset}
            bindings={bindings}
            onBindingsChange={setBindings}
          />
        </div>
      </div>
    </div>
  );
}

export default DataConnector;
