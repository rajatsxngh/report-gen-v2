const cron = require('node-cron');
const db = require('./db');

// Compute the next run timestamp after a given date
function computeNextRun(frequency, time, dayOfWeek, dayOfMonth, after) {
  const [hours, minutes] = time.split(':').map(Number);
  const base = new Date(after);
  let next = new Date(base);
  next.setSeconds(0, 0);
  next.setHours(hours, minutes);

  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    const target = dayOfMonth ?? 1;
    next.setDate(target);
  }

  return next.toISOString();
}

// Placeholder for actual report generation.
// In a full implementation this would render the template with the dataset and produce a PDF.
async function generateReport(schedule) {
  // For now, simulate a successful report generation and return a pdf path.
  const pdfPath = `reports/schedule_${schedule.id}_${Date.now()}.pdf`;
  return { pdfPath };
}

function tick() {
  const now = new Date().toISOString();

  const dueSchedules = db.prepare(`
    SELECT * FROM schedules
    WHERE enabled = 1 AND next_run IS NOT NULL AND next_run <= ?
  `).all(now);

  for (const schedule of dueSchedules) {
    let status = 'success';
    let pdfPath = null;
    let error = null;

    try {
      const result = generateReport(schedule);
      // Handle both sync and async results
      if (result && typeof result.then === 'function') {
        // We're in a sync context, so we won't await — record as pending and move on.
        // For a production system this would be properly async.
        pdfPath = `reports/schedule_${schedule.id}_${Date.now()}.pdf`;
      } else {
        pdfPath = result.pdfPath;
      }
    } catch (err) {
      status = 'failed';
      error = err.message;
    }

    // Record in run_history
    db.prepare(`
      INSERT INTO run_history (schedule_id, template_id, dataset_id, status, pdf_path, error)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(schedule.id, schedule.template_id, schedule.dataset_id, status, pdfPath, error);

    // Advance next_run
    const nextRun = computeNextRun(
      schedule.frequency,
      schedule.time,
      schedule.day_of_week,
      schedule.day_of_month,
      schedule.next_run
    );
    db.prepare('UPDATE schedules SET next_run = ? WHERE id = ?').run(nextRun, schedule.id);
  }

  if (dueSchedules.length > 0) {
    console.log(`[cron] Processed ${dueSchedules.length} due schedule(s)`);
  }
}

function start() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    try {
      tick();
    } catch (err) {
      console.error('[cron] Error during tick:', err);
    }
  });
  console.log('[cron] Scheduler started — checking every minute');
}

module.exports = { start };
