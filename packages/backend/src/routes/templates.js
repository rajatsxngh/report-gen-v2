const express = require('express');
const db = require('../db');

const router = express.Router();

// 2.1 GET /api/templates — list all templates ordered by updated_at DESC
router.get('/', (req, res) => {
  const templates = db.prepare(
    'SELECT * FROM templates ORDER BY updated_at DESC'
  ).all();
  res.json(templates);
});

// 2.2 POST /api/templates — create template with {name, description}
router.post('/', (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const result = db.prepare(
    'INSERT INTO templates (name, description) VALUES (?, ?)'
  ).run(name.trim(), description || null);

  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(template);
});

// 2.3 GET /api/templates/:id — fetch template with all elements
router.get('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const elements = db.prepare(
    'SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order ASC'
  ).all(req.params.id);

  // Parse JSON fields on elements
  const parsedElements = elements.map(el => ({
    ...el,
    position: JSON.parse(el.position || '{}'),
    size: JSON.parse(el.size || '{}'),
    config: JSON.parse(el.config || '{}'),
    data_binding: JSON.parse(el.data_binding || '{}'),
  }));

  res.json({ ...template, elements: parsedElements });
});

// 2.4 PUT /api/templates/:id — update name/description, refresh updated_at
router.put('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const { name, description } = req.body;

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }

  const updatedName = name !== undefined ? name.trim() : template.name;
  const updatedDescription = description !== undefined ? description : template.description;

  db.prepare(
    "UPDATE templates SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(updatedName, updatedDescription, req.params.id);

  const updated = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// 2.5 DELETE /api/templates/:id — delete template (cascade deletes elements)
router.delete('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// 2.6 POST /api/templates/:id/elements — add element
router.post('/:id/elements', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const { type, label, position, size, config, data_binding, sort_order } = req.body;

  if (!type || typeof type !== 'string') {
    return res.status(400).json({ error: 'type is required' });
  }

  const result = db.prepare(
    `INSERT INTO template_elements (template_id, type, label, position, size, config, data_binding, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.params.id,
    type,
    label || null,
    JSON.stringify(position || {}),
    JSON.stringify(size || {}),
    JSON.stringify(config || {}),
    JSON.stringify(data_binding || {}),
    sort_order ?? 0
  );

  const element = db.prepare('SELECT * FROM template_elements WHERE id = ?').get(result.lastInsertRowid);

  // Update template's updated_at
  db.prepare("UPDATE templates SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

  res.status(201).json({
    ...element,
    position: JSON.parse(element.position || '{}'),
    size: JSON.parse(element.size || '{}'),
    config: JSON.parse(element.config || '{}'),
    data_binding: JSON.parse(element.data_binding || '{}'),
  });
});

// 2.7 PUT /api/templates/:id/elements/:elementId — update element
router.put('/:id/elements/:elementId', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const element = db.prepare(
    'SELECT * FROM template_elements WHERE id = ? AND template_id = ?'
  ).get(req.params.elementId, req.params.id);

  if (!element) {
    return res.status(404).json({ error: 'Element not found' });
  }

  const { type, label, position, size, config, data_binding, sort_order } = req.body;

  const updatedType = type !== undefined ? type : element.type;
  const updatedLabel = label !== undefined ? label : element.label;
  const updatedPosition = position !== undefined ? JSON.stringify(position) : element.position;
  const updatedSize = size !== undefined ? JSON.stringify(size) : element.size;
  const updatedConfig = config !== undefined ? JSON.stringify(config) : element.config;
  const updatedDataBinding = data_binding !== undefined ? JSON.stringify(data_binding) : element.data_binding;
  const updatedSortOrder = sort_order !== undefined ? sort_order : element.sort_order;

  db.prepare(
    `UPDATE template_elements
     SET type = ?, label = ?, position = ?, size = ?, config = ?, data_binding = ?, sort_order = ?
     WHERE id = ? AND template_id = ?`
  ).run(
    updatedType, updatedLabel, updatedPosition, updatedSize,
    updatedConfig, updatedDataBinding, updatedSortOrder,
    req.params.elementId, req.params.id
  );

  // Update template's updated_at
  db.prepare("UPDATE templates SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

  const updated = db.prepare('SELECT * FROM template_elements WHERE id = ?').get(req.params.elementId);
  res.json({
    ...updated,
    position: JSON.parse(updated.position || '{}'),
    size: JSON.parse(updated.size || '{}'),
    config: JSON.parse(updated.config || '{}'),
    data_binding: JSON.parse(updated.data_binding || '{}'),
  });
});

// 2.8 DELETE /api/templates/:id/elements/:elementId — remove element
router.delete('/:id/elements/:elementId', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const element = db.prepare(
    'SELECT * FROM template_elements WHERE id = ? AND template_id = ?'
  ).get(req.params.elementId, req.params.id);

  if (!element) {
    return res.status(404).json({ error: 'Element not found' });
  }

  db.prepare('DELETE FROM template_elements WHERE id = ? AND template_id = ?')
    .run(req.params.elementId, req.params.id);

  // Update template's updated_at
  db.prepare("UPDATE templates SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

  res.status(204).end();
});

// 2.9 PUT /api/templates/:id/elements — batch save: delete all existing, insert provided array
function batchSaveElements(req, res) {
  const elements = req.body;

  if (!Array.isArray(elements)) {
    return res.status(400).json({ error: 'Request body must be an array of elements' });
  }

  const insertElement = db.prepare(
    `INSERT INTO template_elements (template_id, type, label, position, size, config, data_binding, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const batchSave = db.transaction((templateId, elems) => {
    // Delete all existing elements for this template
    db.prepare('DELETE FROM template_elements WHERE template_id = ?').run(templateId);

    // Insert new elements
    for (const el of elems) {
      insertElement.run(
        templateId,
        el.type,
        el.label || null,
        JSON.stringify(el.position || {}),
        JSON.stringify(el.size || {}),
        JSON.stringify(el.config || {}),
        JSON.stringify(el.data_binding || {}),
        el.sort_order ?? 0
      );
    }

    // Update template's updated_at
    db.prepare("UPDATE templates SET updated_at = datetime('now') WHERE id = ?").run(templateId);
  });

  batchSave(req.params.id, elements);

  // Return the saved elements
  const saved = db.prepare(
    'SELECT * FROM template_elements WHERE template_id = ? ORDER BY sort_order ASC'
  ).all(req.params.id);

  const parsedSaved = saved.map(el => ({
    ...el,
    position: JSON.parse(el.position || '{}'),
    size: JSON.parse(el.size || '{}'),
    config: JSON.parse(el.config || '{}'),
    data_binding: JSON.parse(el.data_binding || '{}'),
  }));

  res.json(parsedSaved);
}

router.put('/:id/elements', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  return batchSaveElements(req, res);
});

module.exports = router;
