const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/templates — list all templates with their elements
router.get('/', (req, res) => {
  const templates = db.prepare('SELECT * FROM templates').all();
  const getElements = db.prepare(
    'SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order'
  );
  const result = templates.map((t) => ({
    ...t,
    elements: getElements.all(t.id).map((el) => ({
      ...el,
      config: JSON.parse(el.config),
    })),
  }));
  res.json(result);
});

// GET /api/templates/:id — get a single template with its elements
router.get('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  const elements = db
    .prepare('SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order')
    .all(template.id);
  res.json({
    ...template,
    elements: elements.map((el) => ({
      ...el,
      config: JSON.parse(el.config),
    })),
  });
});

module.exports = router;
