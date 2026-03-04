const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/datasets — return all datasets without full data payload
router.get('/', (req, res) => {
  const datasets = db
    .prepare('SELECT id, name, description, category FROM datasets')
    .all();
  res.json(datasets);
});

// GET /api/datasets/:id — return dataset with full data (parsed from JSON column)
router.get('/:id', (req, res) => {
  const dataset = db
    .prepare('SELECT id, name, description, category, data FROM datasets WHERE id = ?')
    .get(req.params.id);

  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  dataset.data = JSON.parse(dataset.data);
  res.json(dataset);
});

// GET /api/datasets/:id/fields — extract field names and types from dataset data
router.get('/:id/fields', (req, res) => {
  const dataset = db
    .prepare('SELECT data FROM datasets WHERE id = ?')
    .get(req.params.id);

  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  const rows = JSON.parse(dataset.data);

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.json([]);
  }

  const firstRow = rows[0];
  const fields = Object.entries(firstRow).map(([name, value]) => ({
    name,
    type: typeof value,
  }));

  res.json(fields);
});

module.exports = router;
