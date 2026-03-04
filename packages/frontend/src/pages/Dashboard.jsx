import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import StatsBar from '../components/StatsBar';
import ReportCard from '../components/ReportCard';
import '../components/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const result = await api.get('/dashboard/summary');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRunNow = async (template) => {
    try {
      await api.post('/reports/generate', { template_id: template.id });
      fetchDashboard();
    } catch (err) {
      setError(`Failed to run report: ${err.message}`);
    }
  };

  const handleEdit = (template) => {
    navigate(`/templates/${template.id}`);
  };

  const handleDelete = (template) => {
    setDeleteTarget(template);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/templates/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchDashboard();
    } catch (err) {
      setError(`Failed to delete template: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error && !data) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  const { templates, stats } = data;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <StatsBar stats={stats} />

      {templates.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-state__title">No templates yet</h2>
          <p className="empty-state__text">
            Create your first report template to get started.
          </p>
          <Link to="/templates" className="empty-state__link">
            Create Template
          </Link>
        </div>
      ) : (
        <div className="report-cards-grid">
          {templates.map((template) => (
            <ReportCard
              key={template.id}
              template={template}
              onRunNow={handleRunNow}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="confirm-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="confirm-dialog__actions">
              <button
                className="btn btn--secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className="btn btn--danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
