import { useDraggable } from '@dnd-kit/core';

const ELEMENT_TYPES = [
  { type: 'header', label: 'Header' },
  { type: 'text', label: 'Text Block' },
  { type: 'bar-chart', label: 'Bar Chart' },
  { type: 'line-chart', label: 'Line Chart' },
  { type: 'table', label: 'Table' },
];

function PaletteIcon({ type }) {
  switch (type) {
    case 'header':
      return <span className="palette-icon">H</span>;
    case 'text':
      return <span className="palette-icon">Aa</span>;
    case 'bar-chart':
      return (
        <span className="palette-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="8" width="3" height="7" rx="0.5" />
            <rect x="6" y="4" width="3" height="11" rx="0.5" />
            <rect x="11" y="1" width="3" height="14" rx="0.5" />
          </svg>
        </span>
      );
    case 'line-chart':
      return (
        <span className="palette-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="1,12 5,7 9,9 15,3" />
          </svg>
        </span>
      );
    case 'table':
      return (
        <span className="palette-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="1" y="1" width="14" height="14" rx="1" />
            <line x1="1" y1="5" x2="15" y2="5" />
            <line x1="1" y1="9" x2="15" y2="9" />
            <line x1="6" y1="1" x2="6" y2="15" />
            <line x1="11" y1="1" x2="11" y2="15" />
          </svg>
        </span>
      );
    default:
      return <span className="palette-icon">?</span>;
  }
}

function DraggablePaletteItem({ type, label }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { fromPalette: true, elementType: type, label },
  });

  return (
    <div
      ref={setNodeRef}
      className={`palette-item${isDragging ? ' dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <PaletteIcon type={type} />
      <span>{label}</span>
    </div>
  );
}

function ElementPalette() {
  return (
    <aside className="element-palette">
      <div className="palette-title">Elements</div>
      <div className="palette-items">
        {ELEMENT_TYPES.map((et) => (
          <DraggablePaletteItem key={et.type} type={et.type} label={et.label} />
        ))}
      </div>
    </aside>
  );
}

export default ElementPalette;
