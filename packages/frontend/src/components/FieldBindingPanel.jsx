function getInputsForType(type) {
  switch (type) {
    case 'bar-chart':
    case 'line-chart':
      return ['xAxis', 'yAxis'];
    case 'table':
      return ['columns'];
    case 'text':
    case 'header':
      return ['content'];
    default:
      return ['value'];
  }
}

function FieldBindingPanel({ template, dataset, bindings, onBindingsChange }) {
  if (!template || !dataset) {
    return (
      <div className="field-binding-panel">
        <h2>Field Bindings</h2>
        <p className="empty-state">
          Select a template and dataset to configure bindings.
        </p>
      </div>
    );
  }

  const fields = dataset.fields || [];
  const elements = template.elements || [];

  function handleChange(elementId, inputName, value) {
    const updated = { ...bindings };
    if (!updated[elementId]) updated[elementId] = {};
    updated[elementId][inputName] = value;
    onBindingsChange(updated);
  }

  return (
    <div className="field-binding-panel">
      <h2>Field Bindings</h2>
      <p className="binding-info">
        Binding <strong>{dataset.name}</strong> to template{' '}
        <strong>{template.name}</strong>
      </p>
      {elements.length === 0 && (
        <p className="empty-state">This template has no elements to bind.</p>
      )}
      <div className="binding-elements">
        {elements.map((el) => {
          const inputs = getInputsForType(el.type);
          return (
            <div key={el.id} className="binding-element">
              <div className="binding-element-header">
                <span className="binding-element-type">{el.type}</span>
                <span className="binding-element-label">
                  {el.label || 'Untitled'}
                </span>
              </div>
              <div className="binding-inputs">
                {inputs.map((inputName) => {
                  const isMulti = inputName === 'columns';
                  const currentValue =
                    bindings[el.id]?.[inputName] || (isMulti ? [] : '');
                  return (
                    <div key={inputName} className="binding-input-row">
                      <label>{inputName}</label>
                      {isMulti ? (
                        <select
                          multiple
                          value={currentValue}
                          onChange={(e) => {
                            const selected = Array.from(
                              e.target.selectedOptions,
                              (o) => o.value
                            );
                            handleChange(el.id, inputName, selected);
                          }}
                        >
                          {fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={currentValue}
                          onChange={(e) =>
                            handleChange(el.id, inputName, e.target.value)
                          }
                        >
                          <option value="">— select field —</option>
                          {fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FieldBindingPanel;
