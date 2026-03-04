function ConfigPanel({ element, onChange }) {
  if (!element) {
    return (
      <aside className="config-panel">
        <div className="config-panel-empty">
          Select an element on the canvas to configure it
        </div>
      </aside>
    );
  }

  const updateConfig = (key, value) => {
    onChange(element.id, {
      ...element,
      config: { ...element.config, [key]: value },
    });
  };

  const updateLabel = (value) => {
    onChange(element.id, { ...element, label: value });
  };

  return (
    <aside className="config-panel">
      <div className="config-panel-header">Properties</div>
      <div className="config-fields">
        <div className="config-field">
          <label>Label</label>
          <input
            type="text"
            value={element.label}
            onChange={(e) => updateLabel(e.target.value)}
          />
        </div>

        {element.type === 'header' && <HeaderConfig config={element.config} updateConfig={updateConfig} />}
        {element.type === 'text' && <TextConfig config={element.config} updateConfig={updateConfig} />}
        {(element.type === 'bar-chart' || element.type === 'line-chart') && (
          <ChartConfig config={element.config} updateConfig={updateConfig} />
        )}
        {element.type === 'table' && <TableConfig config={element.config} updateConfig={updateConfig} />}
      </div>
    </aside>
  );
}

function HeaderConfig({ config, updateConfig }) {
  return (
    <>
      <div className="config-field">
        <label>Text</label>
        <input
          type="text"
          value={config.text || ''}
          onChange={(e) => updateConfig('text', e.target.value)}
          placeholder="Header text"
        />
      </div>
      <div className="config-field">
        <label>Level</label>
        <select
          value={config.level || 1}
          onChange={(e) => updateConfig('level', Number(e.target.value))}
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
          <option value={5}>H5</option>
          <option value={6}>H6</option>
        </select>
      </div>
    </>
  );
}

function TextConfig({ config, updateConfig }) {
  return (
    <>
      <div className="config-field">
        <label>Content</label>
        <textarea
          value={config.content || ''}
          onChange={(e) => updateConfig('content', e.target.value)}
          placeholder="Enter text content..."
        />
      </div>
      <div className="config-field">
        <label>Font Size (px)</label>
        <input
          type="number"
          value={config.fontSize || 14}
          onChange={(e) => updateConfig('fontSize', Number(e.target.value))}
          min={8}
          max={72}
        />
      </div>
    </>
  );
}

function ChartConfig({ config, updateConfig }) {
  return (
    <>
      <div className="config-field">
        <label>Title</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="Chart title"
        />
      </div>
      <div className="config-field">
        <label>X Axis Field</label>
        <input
          type="text"
          value={config.xAxis || ''}
          onChange={(e) => updateConfig('xAxis', e.target.value)}
          placeholder="e.g. month"
        />
      </div>
      <div className="config-field">
        <label>Y Axis Field</label>
        <input
          type="text"
          value={config.yAxis || ''}
          onChange={(e) => updateConfig('yAxis', e.target.value)}
          placeholder="e.g. revenue"
        />
      </div>
      <div className="config-field">
        <label>Color</label>
        <input
          type="color"
          value={config.color || '#4f46e5'}
          onChange={(e) => updateConfig('color', e.target.value)}
        />
      </div>
    </>
  );
}

function TableConfig({ config, updateConfig }) {
  return (
    <div className="config-field">
      <label>Columns (comma-separated)</label>
      <input
        type="text"
        value={config.columns || ''}
        onChange={(e) => updateConfig('columns', e.target.value)}
        placeholder="e.g. name, revenue, units"
      />
    </div>
  );
}

export default ConfigPanel;
