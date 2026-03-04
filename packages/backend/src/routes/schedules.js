const express = require('express');
const router = express.Router();
const db = require('../db');

// --- helpers ---

function computeNextRun(frequency, time, dayOfWeek, dayOfMonth) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  let next = new Date(now);
  next.setSeconds(0, 0);
  next.setHours(hours, minutes);

  if (frequency === 'daily') {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    // dayOfWeek: 0=Sunday … 6=Saturday
    const target = dayOfWeek ?? 0;
    const diff = (target - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + diff);
    if (next <= now) next.setDate(next.getDate() + 7);
  } else if (frequency === 'monthly') {
    const target = dayOfMonth ?? 1;
    next.setDate(target);
    if (next <= now) next.setMonth(next.getMonth() + 1, target);
  }

  return next.toISOString();
}

// --- routes ---

// 6.1  POST /api/schedules — create schedule
router.post('/', (req, res) => {
  const { template_id, dataset_id, frequency, time, day_of_week, day_of_month, enabled } = req.body;

  if (!template_id || !dataset_id || !frequency || !time) {
    return res.status(400).json({ error: 'template_id, dataset_id, frequency, and time are required' });
  }

  const isEnabled = enabled !== undefined ? (enabled ? 1 : 0) : 1;
  const next_run = computeNextRun(frequency, time, day_of_week, day_of_month);

  const stmt = db.prepare(`
    INSERT INTO schedules (template_id, dataset_id, frequency, time, day_of_week, day_of_month, next_run, enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(template_id, dataset_id, frequency, time, day_of_week ?? null, day_of_month ?? null, next_run, isEnabled);
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(schedule);
});

// 6.2  GET /api/schedules — list all schedules with template_name and dataset_name
router.get('/', (req, res) => {
  const schedules = db.prepare(`
    SELECT s.*, t.name AS template_name, d.name AS dataset_name
    FROM schedules s
    JOIN templates t ON s.template_id = t.id
    JOIN datasets  d ON s.dataset_id  = d.id
    ORDER BY s.created_at DESC
  `).all();

  res.json(schedules);
});

// 6.6  GET /api/schedules/upcoming — next 10 scheduled runs (must be above :id routes)
router.get('/upcoming', (req, res) => {
  const upcoming = db.prepare(`
    SELECT s.*, t.name AS template_name, d.name AS dataset_name
    FROM schedules s
    JOIN templates t ON s.template_id = t.id
    JOIN datasets  d ON s.dataset_id  = d.id
    WHERE s.enabled = 1 AND s.next_run IS NOT NULL
    ORDER BY s.next_run ASC
    LIMIT 10
  `).all();

  res.json(upcoming);
});

// 6.3  PUT /api/schedules/:id — update schedule, recompute next_run
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found' });

  const {
    template_id = existing.template_id,
    dataset_id  = existing.dataset_id,
    frequency   = existing.frequency,
    time        = existing.time,
    day_of_week = existing.day_of_week,
    day_of_month = existing.day_of_month,
    enabled,
  } = req.body;

  const isEnabled = enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled;
  const next_run = computeNextRun(frequency, time, day_of_week, day_of_month);

  db.prepare(`
    UPDATE schedules
    SET template_id = ?, dataset_id = ?, frequency = ?, time = ?,
        day_of_week = ?, day_of_month = ?, next_run = ?, enabled = ?
    WHERE id = ?
  `).run(template_id, dataset_id, frequency, time, day_of_week ?? null, day_of_month ?? null, next_run, isEnabled, id);

  const updated = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  res.json(updated);
});

// 6.4  DELETE /api/schedules/:id — delete schedule (run_history preserved via SET NULL)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found' });

  db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
  res.json({ message: 'Schedule deleted' });
});

// 6.5  PATCH /api/schedules/:id/toggle — toggle enabled/disabled
router.patch('/:id/toggle', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found' });

  const newEnabled = existing.enabled ? 0 : 1;
  db.prepare('UPDATE schedules SET enabled = ? WHERE id = ?').run(newEnabled, id);

  const updated = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  res.json(updated);
});

// 6.7  GET /api/schedules/:id/history — run history for a schedule, most recent first
router.get('/:id/history', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Schedule not found' });

  const history = db.prepare(`
    SELECT * FROM run_history
    WHERE schedule_id = ?
    ORDER BY created_at DESC
  `).all(id);

  res.json(history);
});

module.exports = router;
