const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { renderTemplate } = require('../services/templateRenderer');
const { generatePdf } = require('../services/pdfGenerator');

const router = express.Router();

// 8.4 GET /api/reports — list all runs with template and dataset names
router.get('/', (req, res) => {
  try {
    const runs = db.prepare(`
      SELECT
        r.id,
        r.schedule_id,
        r.template_id,
        r.dataset_id,
        r.status,
        r.pdf_path,
        r.error,
        r.created_at,
        t.name AS template_name,
        d.name AS dataset_name
      FROM run_history r
      LEFT JOIN templates t ON r.template_id = t.id
      LEFT JOIN datasets d ON r.dataset_id = d.id
      ORDER BY r.created_at DESC
    `).all();

    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.3 POST /api/reports/generate — generate a PDF report
router.post('/generate', async (req, res) => {
  const { template_id, dataset_id } = req.body;

  if (!template_id || !dataset_id) {
    return res.status(400).json({ error: 'template_id and dataset_id are required' });
  }

  try {
    // Fetch template
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(template_id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Fetch template elements ordered by sort_order
    const elements = db.prepare(
      'SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order'
    ).all(template_id);

    // Fetch dataset
    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(dataset_id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const data = JSON.parse(dataset.data);

    // Render template to HTML
    const html = renderTemplate(elements, data);

    // Generate PDF
    const pdfPath = await generatePdf(html, template_id);

    // Record run in run_history
    const result = db.prepare(`
      INSERT INTO run_history (template_id, dataset_id, status, pdf_path)
      VALUES (?, ?, 'success', ?)
    `).run(template_id, dataset_id, pdfPath);

    const run = db.prepare('SELECT * FROM run_history WHERE id = ?').get(result.lastInsertRowid);

    res.json(run);
  } catch (err) {
    // Record failed run
    try {
      db.prepare(`
        INSERT INTO run_history (template_id, dataset_id, status, error)
        VALUES (?, ?, 'error', ?)
      `).run(template_id, dataset_id, err.message);
    } catch (_) {
      // ignore recording error
    }

    res.status(500).json({ error: err.message });
  }
});

// 8.5 GET /api/reports/download/:runId — serve PDF file
router.get('/download/:runId', (req, res) => {
  try {
    const run = db.prepare('SELECT * FROM run_history WHERE id = ?').get(req.params.runId);
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    if (!run.pdf_path || !fs.existsSync(run.pdf_path)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    const filename = path.basename(run.pdf_path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(run.pdf_path).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.6 POST /api/reports/send/:runId — simulate email delivery
router.post('/send/:runId', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const run = db.prepare('SELECT * FROM run_history WHERE id = ?').get(req.params.runId);
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    if (!run.pdf_path) {
      return res.status(400).json({ error: 'No PDF associated with this run' });
    }

    // Simulate email delivery
    console.log(`[EMAIL SIMULATION] Sending report to: ${email}`);
    console.log(`  Run ID: ${run.id}`);
    console.log(`  PDF: ${run.pdf_path}`);
    console.log(`  Status: delivered`);

    res.json({
      success: true,
      message: `Report emailed to ${email} (simulated)`,
      run_id: run.id,
      email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
