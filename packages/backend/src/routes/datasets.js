const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/datasets — list all datasets (summary without full data)
router.get('/', (req, res) => {
  const datasets = db.prepare('SELECT id, name, description, data, created_at FROM datasets').all();
  const result = datasets.map((ds) => {
    const rows = JSON.parse(ds.data);
    const fields = rows.length > 0 ? Object.keys(rows[0]) : [];
    return {
      id: ds.id,
      name: ds.name,
      description: ds.description,
      rowCount: rows.length,
      fields,
      created_at: ds.created_at,
    };
  });
  res.json(result);
});

// GET /api/datasets/:id — get a single dataset including its data
router.get('/:id', (req, res) => {
  const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(req.params.id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }
  const rows = JSON.parse(dataset.data);
  res.json({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    rowCount: rows.length,
    fields: rows.length > 0 ? Object.keys(rows[0]) : [],
    data: rows,
    created_at: dataset.created_at,
  });
});

module.exports = router;
