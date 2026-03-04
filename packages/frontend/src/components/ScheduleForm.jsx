import { useState, useEffect } from 'react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

const emptyForm = {
  template_id: '',
  dataset_id: '',
  frequency: 'daily',
  time: '09:00',
  day_of_week: 1,
  day_of_month: 1,
};

function ScheduleForm({ templates, datasets, schedule, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (schedule) {
      setForm({
        template_id: schedule.template_id,
        dataset_id: schedule.dataset_id,
        frequency: schedule.frequency,
        time: schedule.time,
        day_of_week: schedule.day_of_week ?? 1,
        day_of_month: schedule.day_of_month ?? 1,
      });
    } else {
      setForm(emptyForm);
    }
  }, [schedule]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      template_id: Number(form.template_id),
      dataset_id: Number(form.dataset_id),
      frequency: form.frequency,
      time: form.time,
    };
    if (form.frequency === 'weekly') {
      payload.day_of_week = Number(form.day_of_week);
    }
    if (form.frequency === 'monthly') {
      payload.day_of_month = Number(form.day_of_month);
    }
    onSubmit(payload);
  }

  const isEditing = !!schedule;

  return (
    <div className="schedule-form-backdrop" onClick={onCancel}>
      <form
        className="schedule-form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{isEditing ? 'Edit Schedule' : 'New Schedule'}</h2>

        <label className="form-field">
          <span>Template</span>
          <select
            name="template_id"
            value={form.template_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Dataset</span>
          <select
            name="dataset_id"
            value={form.dataset_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a dataset</option>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Frequency</span>
          <select name="frequency" value={form.frequency} onChange={handleChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>

        {form.frequency === 'weekly' && (
          <label className="form-field">
            <span>Day of Week</span>
            <select
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {form.frequency === 'monthly' && (
          <label className="form-field">
            <span>Day of Month</span>
            <select
              name="day_of_month"
              value={form.day_of_month}
              onChange={handleChange}
            >
              {DAYS_OF_MONTH.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="form-field">
          <span>Time</span>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleForm;
