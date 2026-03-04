import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useCallback } from 'react';

function ElementPreview({ element }) {
  const { type, config } = element;

  switch (type) {
    case 'header': {
      const level = config.level || 1;
      const text = config.text || 'Header';
      const className = `element-preview-header h${level}`;
      return <div className={className}>{text}</div>;
    }
    case 'text':
      return (
        <div className="element-preview-text">
          {config.content || 'Text block content...'}
        </div>
      );
    case 'bar-chart':
      return (
        <div className="element-preview-chart">
          <div className="preview-bar" style={{ height: '60%' }} />
          <div className="preview-bar" style={{ height: '100%' }} />
          <div className="preview-bar" style={{ height: '40%' }} />
          <div className="preview-bar" style={{ height: '80%' }} />
          <div className="preview-bar" style={{ height: '55%' }} />
          <span className="preview-chart-label">{config.title || 'Bar Chart'}</span>
        </div>
      );
    case 'line-chart':
      return (
        <div className="element-preview-chart">
          <svg className="preview-line-svg" viewBox="0 0 100 40" fill="none">
            <polyline
              points="5,30 20,18 40,25 60,10 80,20 95,5"
              stroke={config.color || '#4f46e5'}
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <span className="preview-chart-label">{config.title || 'Line Chart'}</span>
        </div>
      );
    case 'table':
      return (
        <div className="element-preview-table">
          <div className="preview-table-cell header-cell">Col 1</div>
          <div className="preview-table-cell header-cell">Col 2</div>
          <div className="preview-table-cell header-cell">Col 3</div>
          <div className="preview-table-cell">---</div>
          <div className="preview-table-cell">---</div>
          <div className="preview-table-cell">---</div>
        </div>
      );
    default:
      return <div>Unknown element</div>;
  }
}

const TYPE_LABELS = {
  header: 'Header',
  text: 'Text',
  'bar-chart': 'Bar Chart',
  'line-chart': 'Line Chart',
  table: 'Table',
};

function CanvasElement({ element, isSelected, onSelect, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [resizeHeight, setResizeHeight] = useState(null);

  const handleResizeStart = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = e.currentTarget.parentElement.offsetHeight;

      const onMove = (moveEvent) => {
        const delta = moveEvent.clientY - startY;
        setResizeHeight(Math.max(80, startHeight + delta));
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    []
  );

  const elementStyle = {
    ...style,
    ...(resizeHeight ? { height: `${resizeHeight}px` } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      className={`canvas-element${isSelected ? ' selected' : ''}${isDragging ? ' dragging' : ''}`}
      style={elementStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      <div className="element-header">
        <span className="drag-handle" {...attributes} {...listeners}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="2" r="1" />
            <circle cx="3" cy="6" r="1" />
            <circle cx="3" cy="10" r="1" />
            <circle cx="8" cy="2" r="1" />
            <circle cx="8" cy="6" r="1" />
            <circle cx="8" cy="10" r="1" />
          </svg>
        </span>
        <span className="element-type-badge">{TYPE_LABELS[element.type]}</span>
        <span className="element-label">{element.label}</span>
        <button
          className="element-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          title="Remove element"
        >
          &times;
        </button>
      </div>
      <div className="element-preview">
        <ElementPreview element={element} />
      </div>
      <div className="resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
}

export default CanvasElement;
