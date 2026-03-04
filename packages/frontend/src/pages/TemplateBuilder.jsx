import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import api from '../api';
import ElementPalette from '../components/ElementPalette';
import Canvas from '../components/Canvas';
import ConfigPanel from '../components/ConfigPanel';
import './TemplateBuilder.css';

const DEFAULT_CONFIGS = {
  header: { text: 'Header', level: 1 },
  text: { content: '', fontSize: 14 },
  'bar-chart': { title: 'Bar Chart', xAxis: '', yAxis: '', color: '#4f46e5' },
  'line-chart': { title: 'Line Chart', xAxis: '', yAxis: '', color: '#4f46e5' },
  table: { columns: '' },
};

let elementCounter = 0;

function createNewElement(type) {
  elementCounter += 1;
  const label = `${type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ${elementCounter}`;
  return {
    id: `el-${Date.now()}-${elementCounter}`,
    type,
    label,
    config: { ...DEFAULT_CONFIGS[type] },
    sort_order: 0,
  };
}

function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState(id || null);
  const [name, setName] = useState('Untitled Template');
  const [description, setDescription] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Load existing template
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api
      .get(`/templates/${id}`)
      .then((data) => {
        setTemplateId(data.id);
        setName(data.name);
        setDescription(data.description || '');
        const loaded = (data.elements || []).map((el, i) => ({
          id: `el-${el.id}`,
          serverId: el.id,
          type: el.type,
          label: el.label || '',
          config: typeof el.config === 'string' ? JSON.parse(el.config) : el.config,
          sort_order: el.sort_order ?? i,
        }));
        setElements(loaded);
        elementCounter = loaded.length;
      })
      .catch(() => {
        navigate('/templates', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const isFromPalette = String(active.id).startsWith('palette-');

      if (isFromPalette) {
        const type = active.data.current.elementType;
        const newEl = createNewElement(type);
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        return;
      }

      // Reorder within canvas
      if (active.id !== over.id) {
        setElements((prev) => {
          const oldIndex = prev.findIndex((e) => e.id === active.id);
          const newIndex = prev.findIndex((e) => e.id === over.id);
          if (oldIndex === -1 || newIndex === -1) return prev;
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    []
  );

  const handleSelect = useCallback((elId) => {
    setSelectedId(elId);
  }, []);

  const handleDelete = useCallback(
    (elId) => {
      setElements((prev) => prev.filter((e) => e.id !== elId));
      if (selectedId === elId) setSelectedId(null);
    },
    [selectedId]
  );

  const handleConfigChange = useCallback((elId, updated) => {
    setElements((prev) =>
      prev.map((e) => (e.id === elId ? { ...e, ...updated } : e))
    );
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);

    const payload = {
      name,
      description,
      elements: elements.map((el, i) => ({
        type: el.type,
        label: el.label,
        config: el.config,
        sort_order: i,
      })),
    };

    try {
      if (templateId) {
        await api.put(`/templates/${templateId}`, payload);
      } else {
        const created = await api.post('/templates', {
          name: payload.name,
          description: payload.description,
        });
        const saved = await api.put(`/templates/${created.id}`, payload);
        setTemplateId(saved.id);
        navigate(`/templates/${saved.id}`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }, [name, description, elements, templateId, navigate]);

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  // Find the palette item being dragged for the overlay
  const activePaletteType = activeId && String(activeId).startsWith('palette-')
    ? String(activeId).replace('palette-', '')
    : null;

  if (loading) {
    return <div className="builder-loading">Loading template...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="template-builder">
        <div className="builder-header">
          <input
            type="text"
            className="builder-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
          />
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
        <div className="builder-body">
          <ElementPalette />
          <Canvas
            elements={elements}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
          <ConfigPanel element={selectedElement} onChange={handleConfigChange} />
        </div>
      </div>

      <DragOverlay>
        {activePaletteType ? (
          <div className="drag-overlay-item">
            {activePaletteType.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TemplateBuilder;
