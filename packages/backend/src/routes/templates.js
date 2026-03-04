const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/templates — list all templates
router.get('/', (req, res) => {
  const templates = db
    .prepare('SELECT * FROM templates ORDER BY updated_at DESC')
    .all();
  res.json(templates);
});

// GET /api/templates/:id — get template with its elements
router.get('/:id', (req, res) => {
  const template = db
    .prepare('SELECT * FROM templates WHERE id = ?')
    .get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const elements = db
    .prepare(
      'SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order'
    )
    .all(req.params.id);

  res.json({ ...template, elements });
});

// POST /api/templates — create a new template
router.post('/', (req, res) => {
  const { name, description } = req.body;
  const result = db
    .prepare('INSERT INTO templates (name, description) VALUES (?, ?)')
    .run(name || 'Untitled Template', description || '');

  const template = db
    .prepare('SELECT * FROM templates WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(template);
});

// PUT /api/templates/:id — update template and batch-save elements
router.put('/:id', (req, res) => {
  const { name, description, elements } = req.body;

  const template = db
    .prepare('SELECT * FROM templates WHERE id = ?')
    .get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  db.prepare(
    "UPDATE templates SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(
    name || template.name,
    description !== undefined ? description : template.description,
    req.params.id
  );

  if (elements) {
    const saveElements = db.transaction((elems) => {
      db.prepare('DELETE FROM template_elements WHERE template_id = ?').run(
        req.params.id
      );

      const insert = db.prepare(
        'INSERT INTO template_elements (template_id, type, label, config, sort_order) VALUES (?, ?, ?, ?, ?)'
      );

      for (const elem of elems) {
        insert.run(
          req.params.id,
          elem.type,
          elem.label || '',
          JSON.stringify(elem.config || {}),
          elem.sort_order ?? 0
        );
      }
    });

    saveElements(elements);
  }

  const updated = db
    .prepare('SELECT * FROM templates WHERE id = ?')
    .get(req.params.id);
  const updatedElements = db
    .prepare(
      'SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order'
    )
    .all(req.params.id);

  res.json({ ...updated, elements: updatedElements });
});

// DELETE /api/templates/:id — delete a template
router.delete('/:id', (req, res) => {
  const template = db
    .prepare('SELECT * FROM templates WHERE id = ?')
    .get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.json({ message: 'Template deleted' });
});

module.exports = router;
