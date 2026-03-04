import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import GenerateReportForm from '../components/GenerateReportForm';
import ReportList from '../components/ReportList';
import './Reports.css';

function Reports() {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const data = await api.get('/reports');
      setReports(data);
    } catch {
      setError('Failed to load reports.');
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Fetch templates and datasets for the generate form
    api.get('/templates').then(setTemplates).catch(() => {});
    api.get('/datasets').then(setDatasets).catch(() => {});
  }, [fetchReports]);

  async function handleGenerate(payload) {
    setError(null);
    try {
      await api.post('/reports/generate', payload);
      await fetchReports();
    } catch {
      setError('Failed to generate report.');
      throw new Error('generation failed');
    }
  }

  function handleDownload(report) {
    window.open(`/api/reports/${report.id}/download`, '_blank');
  }

  async function handleSendEmail(report) {
    setError(null);
    try {
      const result = await api.post(`/reports/${report.id}/send-email`);
      alert(result.message);
    } catch {
      setError('Failed to send email.');
    }
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Generate Report
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <ReportList
        reports={reports}
        onDownload={handleDownload}
        onSendEmail={handleSendEmail}
      />

      {showForm && (
        <GenerateReportForm
          templates={templates}
          datasets={datasets}
          onGenerate={handleGenerate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default Reports;
