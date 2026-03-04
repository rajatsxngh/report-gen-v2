import { useState } from 'react';

function GenerateReportForm({ templates, datasets, onGenerate, onClose }) {
  const [templateId, setTemplateId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!templateId || !datasetId) return;

    setSubmitting(true);
    try {
      await onGenerate({ template_id: Number(templateId), dataset_id: Number(datasetId) });
      onClose();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Generate Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="template-select">Template</label>
            <select
              id="template-select"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              required
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dataset-select">Dataset</label>
            <select
              id="dataset-select"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              required
            >
              <option value="">Select a dataset...</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !templateId || !datasetId}>
              {submitting ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateReportForm;
