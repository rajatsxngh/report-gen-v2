import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import CanvasElement from './CanvasElement';

function Canvas({ elements, selectedId, onSelect, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div className="canvas-wrapper">
      <div className="canvas-area">
        <div
          ref={setNodeRef}
          className={`canvas-drop-zone${isOver ? ' over' : ''}`}
        >
          {elements.length === 0 ? (
            <div className="canvas-empty">
              <div className="canvas-empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#b0b0cc" strokeWidth="1.5">
                  <rect x="8" y="8" width="32" height="32" rx="4" strokeDasharray="4 3" />
                  <line x1="24" y1="18" x2="24" y2="30" />
                  <line x1="18" y1="24" x2="30" y2="24" />
                </svg>
              </div>
              <p>Drag elements from the palette to start building your template</p>
            </div>
          ) : (
            <SortableContext
              items={elements.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              {elements.map((el) => (
                <CanvasElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}

export default Canvas;
