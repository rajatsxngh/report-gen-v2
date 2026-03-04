const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/reports — list all generated reports with template/dataset names
router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT
         r.id,
         r.template_id,
         r.dataset_id,
         r.status,
         r.pdf_path,
         r.error,
         r.created_at,
         t.name AS template_name,
         d.name AS dataset_name
       FROM run_history r
       LEFT JOIN templates t ON t.id = r.template_id
       LEFT JOIN datasets  d ON d.id = r.dataset_id
       ORDER BY r.created_at DESC`
    )
    .all();

  res.json(rows);
});

// POST /api/reports/generate — trigger report generation
router.post('/generate', (req, res) => {
  const { template_id, dataset_id } = req.body;

  if (!template_id || !dataset_id) {
    return res.status(400).json({ error: 'template_id and dataset_id are required' });
  }

  // Verify template exists
  const template = db.prepare('SELECT id, name FROM templates WHERE id = ?').get(template_id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  // Verify dataset exists
  const dataset = db.prepare('SELECT id, name FROM datasets WHERE id = ?').get(dataset_id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  // Insert a run_history record (simulate PDF generation)
  const pdfPath = `/api/reports/download/report_${Date.now()}.pdf`;
  const result = db
    .prepare(
      `INSERT INTO run_history (template_id, dataset_id, status, pdf_path)
       VALUES (?, ?, 'success', ?)`
    )
    .run(template_id, dataset_id, pdfPath);

  const report = db
    .prepare(
      `SELECT
         r.id,
         r.template_id,
         r.dataset_id,
         r.status,
         r.pdf_path,
         r.error,
         r.created_at,
         t.name AS template_name,
         d.name AS dataset_name
       FROM run_history r
       LEFT JOIN templates t ON t.id = r.template_id
       LEFT JOIN datasets  d ON d.id = r.dataset_id
       WHERE r.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(report);
});

// GET /api/reports/:id/download — simulate PDF download
router.get('/:id/download', (req, res) => {
  const report = db.prepare('SELECT * FROM run_history WHERE id = ?').get(req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Send a simple placeholder PDF response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report_${report.id}.pdf"`);
  res.send(Buffer.from('%PDF-1.4 placeholder'));
});

// POST /api/reports/:id/send-email — simulate sending report via email
router.post('/:id/send-email', (req, res) => {
  const report = db.prepare('SELECT * FROM run_history WHERE id = ?').get(req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Simulate email send
  res.json({ message: `Report #${report.id} sent via email successfully (simulated)` });
});

module.exports = router;
