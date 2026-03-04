import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ScheduleForm from '../components/ScheduleForm';
import ScheduleList from '../components/ScheduleList';
import UpcomingRuns from '../components/UpcomingRuns';
import RunHistory from '../components/RunHistory';
import './Scheduler.css';

function Scheduler() {
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [historySchedule, setHistorySchedule] = useState(null);
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await api.get('/schedules');
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [schedulesData, templatesData, datasetsData] = await Promise.all([
          api.get('/schedules'),
          api.get('/templates'),
          api.get('/datasets'),
        ]);
        setSchedules(schedulesData);
        setTemplates(templatesData);
        setDatasets(datasetsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleCreate(payload) {
    try {
      await api.post('/schedules', payload);
      await fetchSchedules();
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(payload) {
    try {
      await api.put(`/schedules/${editingSchedule.id}`, payload);
      await fetchSchedules();
      setShowForm(false);
      setEditingSchedule(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(schedule) {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${schedule.id}`);
      await fetchSchedules();
      if (historySchedule?.id === schedule.id) {
        setHistorySchedule(null);
        setRuns([]);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(schedule) {
    try {
      await api.put(`/schedules/${schedule.id}`, {
        enabled: !schedule.enabled,
      });
      await fetchSchedules();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(schedule) {
    setEditingSchedule(schedule);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingSchedule(null);
  }

  async function handleViewHistory(schedule) {
    setHistorySchedule(schedule);
    setRunsLoading(true);
    try {
      const data = await api.get(`/schedules/${schedule.id}/runs`);
      setRuns(data);
    } catch {
      setRuns([]);
    } finally {
      setRunsLoading(false);
    }
  }

  function getScheduleName(schedule) {
    const t = templates.find((t) => t.id === schedule.template_id);
    return t ? t.name : `Schedule #${schedule.id}`;
  }

  if (loading) {
    return (
      <div className="scheduler-page">
        <h1>Scheduler</h1>
        <p className="loading-message">Loading...</p>
      </div>
    );
  }

  return (
    <div className="scheduler-page">
      <div className="scheduler-header">
        <h1>Scheduler</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingSchedule(null);
            setShowForm(true);
          }}
        >
          New Schedule
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="scheduler-grid">
        <div className="scheduler-main">
          <ScheduleList
            schedules={schedules}
            templates={templates}
            datasets={datasets}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onViewHistory={handleViewHistory}
          />

          {historySchedule && (
            <div className="run-history-section">
              {runsLoading ? (
                <p className="loading-message">Loading history...</p>
              ) : (
                <RunHistory
                  runs={runs}
                  scheduleName={getScheduleName(historySchedule)}
                  onClose={() => {
                    setHistorySchedule(null);
                    setRuns([]);
                  }}
                />
              )}
            </div>
          )}
        </div>

        <aside className="scheduler-sidebar">
          <UpcomingRuns schedules={schedules} templates={templates} />
        </aside>
      </div>

      {showForm && (
        <ScheduleForm
          templates={templates}
          datasets={datasets}
          schedule={editingSchedule}
          onSubmit={editingSchedule ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default Scheduler;
