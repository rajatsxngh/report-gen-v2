const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/summary', (req, res) => {
  // Get all templates with their schedule and last run info
  const templates = db
    .prepare(
      `SELECT
        t.id,
        t.name,
        t.description,
        t.created_at,
        t.updated_at,
        s.id AS schedule_id,
        s.frequency,
        s.time AS schedule_time,
        s.enabled AS schedule_enabled,
        rh.status AS last_run_status,
        rh.created_at AS last_run_at
      FROM templates t
      LEFT JOIN schedules s ON s.template_id = t.id
      LEFT JOIN (
        SELECT template_id, status, created_at,
          ROW_NUMBER() OVER (PARTITION BY template_id ORDER BY created_at DESC) AS rn
        FROM run_history
      ) rh ON rh.template_id = t.id AND rh.rn = 1
      ORDER BY t.updated_at DESC`
    )
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
      schedule: row.schedule_id
        ? {
            id: row.schedule_id,
            frequency: row.frequency,
            time: row.schedule_time,
            enabled: !!row.schedule_enabled,
          }
        : null,
      last_run: row.last_run_status
        ? {
            status: row.last_run_status,
            created_at: row.last_run_at,
          }
        : null,
    }));

  // Compute stats
  const templateCount = db
    .prepare('SELECT COUNT(*) AS count FROM templates')
    .get().count;

  const activeSchedules = db
    .prepare('SELECT COUNT(*) AS count FROM schedules WHERE enabled = 1')
    .get().count;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekStart = oneWeekAgo.toISOString();

  const reportsThisWeek = db
    .prepare(
      'SELECT COUNT(*) AS count FROM run_history WHERE created_at >= ?'
    )
    .get(weekStart).count;

  const failedThisWeek = db
    .prepare(
      "SELECT COUNT(*) AS count FROM run_history WHERE status = 'failed' AND created_at >= ?"
    )
    .get(weekStart).count;

  res.json({
    templates,
    stats: {
      template_count: templateCount,
      active_schedules: activeSchedules,
      reports_this_week: reportsThisWeek,
      failed_this_week: failedThisWeek,
    },
  });
});

module.exports = router;
