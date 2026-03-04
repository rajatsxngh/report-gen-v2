const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 1120;

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render a bar chart as an SVG string.
 */
function renderBarChart(data, xKey, yKey, width, height) {
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => Number(d[yKey]) || 0);
  const maxVal = Math.max(...values, 1);
  const barWidth = Math.max(1, (chartW / data.length) * 0.7);
  const gap = (chartW / data.length) * 0.3;

  let bars = '';
  let labels = '';
  data.forEach((d, i) => {
    const val = Number(d[yKey]) || 0;
    const barH = (val / maxVal) * chartH;
    const x = padding.left + i * (barWidth + gap) + gap / 2;
    const y = padding.top + chartH - barH;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${COLORS[i % COLORS.length]}" />`;
    labels += `<text x="${x + barWidth / 2}" y="${height - padding.bottom + 15}" text-anchor="middle" font-size="10" fill="#333">${escapeHtml(String(d[xKey]))}</text>`;
  });

  // Y-axis ticks
  let yTicks = '';
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * i);
    const y = padding.top + chartH - (i / 4) * chartH;
    yTicks += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">${val}</text>`;
    yTicks += `<line x1="${padding.left}" y1="${y}" x2="${padding.left + chartW}" y2="${y}" stroke="#eee" />`;
  }

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${yTicks}
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#333" />
    <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="#333" />
    ${bars}
    ${labels}
    <text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-size="11" fill="#666">${escapeHtml(xKey)}</text>
    <text x="12" y="${height / 2}" text-anchor="middle" font-size="11" fill="#666" transform="rotate(-90,12,${height / 2})">${escapeHtml(yKey)}</text>
  </svg>`;
}

/**
 * Render a line chart as an SVG string.
 */
function renderLineChart(data, xKey, yKey, width, height) {
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => Number(d[yKey]) || 0);
  const maxVal = Math.max(...values, 1);

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - ((Number(d[yKey]) || 0) / maxVal) * chartH;
    return `${x},${y}`;
  });

  let labels = '';
  const labelStep = Math.max(1, Math.floor(data.length / 10));
  data.forEach((d, i) => {
    if (i % labelStep === 0) {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
      labels += `<text x="${x}" y="${height - padding.bottom + 15}" text-anchor="middle" font-size="10" fill="#333">${escapeHtml(String(d[xKey]))}</text>`;
    }
  });

  let yTicks = '';
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * i);
    const y = padding.top + chartH - (i / 4) * chartH;
    yTicks += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">${val}</text>`;
    yTicks += `<line x1="${padding.left}" y1="${y}" x2="${padding.left + chartW}" y2="${y}" stroke="#eee" />`;
  }

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${yTicks}
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#333" />
    <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="#333" />
    <polyline points="${points.join(' ')}" fill="none" stroke="${COLORS[0]}" stroke-width="2" />
    ${points.map((p, i) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3" fill="${COLORS[0]}" />`).join('')}
    ${labels}
    <text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-size="11" fill="#666">${escapeHtml(xKey)}</text>
    <text x="12" y="${height / 2}" text-anchor="middle" font-size="11" fill="#666" transform="rotate(-90,12,${height / 2})">${escapeHtml(yKey)}</text>
  </svg>`;
}

/**
 * Render a pie chart as an SVG string.
 */
function renderPieChart(data, xKey, yKey, width, height) {
  const cx = width / 2;
  const cy = height / 2 - 10;
  const radius = Math.min(cx, cy) - 40;
  const values = data.map(d => Math.abs(Number(d[yKey]) || 0));
  const total = values.reduce((a, b) => a + b, 0) || 1;

  let slices = '';
  let legendItems = '';
  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const val = Math.abs(Number(d[yKey]) || 0);
    const sliceAngle = (val / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    slices += `<path d="M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z" fill="${COLORS[i % COLORS.length]}" stroke="#fff" stroke-width="1" />`;

    const legendY = height - 20;
    const legendX = 10 + i * Math.floor(width / Math.min(data.length, 6));
    legendItems += `<rect x="${legendX}" y="${legendY}" width="10" height="10" fill="${COLORS[i % COLORS.length]}" />`;
    legendItems += `<text x="${legendX + 14}" y="${legendY + 9}" font-size="10" fill="#333">${escapeHtml(String(d[xKey]))}</text>`;

    startAngle = endAngle;
  });

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${slices}
    ${legendItems}
  </svg>`;
}

/**
 * Render a chart element to an SVG string.
 */
function renderChart(element, data) {
  const config = typeof element.config === 'string' ? JSON.parse(element.config) : element.config;
  const chartType = config.chartType || 'bar';
  const xKey = config.xKey || (data.length > 0 ? Object.keys(data[0])[0] : 'x');
  const yKey = config.yKey || (data.length > 0 ? Object.keys(data[0])[1] : 'y');
  const width = config.width || 500;
  const height = config.height || 300;

  switch (chartType) {
    case 'bar':
      return renderBarChart(data, xKey, yKey, width, height);
    case 'line':
      return renderLineChart(data, xKey, yKey, width, height);
    case 'pie':
      return renderPieChart(data, xKey, yKey, width, height);
    default:
      return `<p>Unsupported chart type: ${escapeHtml(chartType)}</p>`;
  }
}

/**
 * Render a table element to an HTML table string.
 */
function renderTable(element, data) {
  const config = typeof element.config === 'string' ? JSON.parse(element.config) : element.config;
  const columns = config.columns || (data.length > 0 ? Object.keys(data[0]) : []);

  const headerCells = columns.map(col => `<th style="border:1px solid #ddd;padding:8px;background:#f4f4f4;text-align:left;">${escapeHtml(col)}</th>`).join('');
  const rows = data.map(row => {
    const cells = columns.map(col => `<td style="border:1px solid #ddd;padding:8px;">${row[col] != null ? escapeHtml(String(row[col])) : ''}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<table style="border-collapse:collapse;width:100%;font-size:14px;">
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/**
 * Render a text element to a paragraph.
 */
function renderText(element) {
  const config = typeof element.config === 'string' ? JSON.parse(element.config) : element.config;
  const content = config.content || element.label || '';
  return `<p style="margin:8px 0;font-size:14px;line-height:1.6;">${escapeHtml(content)}</p>`;
}

/**
 * Render a header element to h1/h2/h3.
 */
function renderHeader(element) {
  const config = typeof element.config === 'string' ? JSON.parse(element.config) : element.config;
  const level = config.level || 1;
  const content = config.content || element.label || '';
  const tag = `h${Math.min(Math.max(level, 1), 3)}`;
  return `<${tag} style="margin:12px 0;">${escapeHtml(content)}</${tag}>`;
}

/**
 * Render all template elements into a full HTML document.
 * @param {Array} elements - template_elements rows sorted by sort_order
 * @param {Array} data - parsed dataset data array
 * @returns {string} Full HTML document string
 */
function renderTemplate(elements, data) {
  const renderedElements = elements.map((el, index) => {
    let html = '';

    switch (el.type) {
      case 'bar_chart':
      case 'line_chart':
      case 'pie_chart': {
        const config = typeof el.config === 'string' ? JSON.parse(el.config) : el.config;
        if (!config.chartType) {
          config.chartType = el.type.replace('_chart', '');
          el.config = JSON.stringify(config);
        }
        html = renderChart(el, data);
        break;
      }
      case 'chart':
        html = renderChart(el, data);
        break;
      case 'table':
        html = renderTable(el, data);
        break;
      case 'text':
        html = renderText(el);
        break;
      case 'header':
        html = renderHeader(el);
        break;
      default:
        html = `<p>Unknown element type: ${escapeHtml(el.type)}</p>`;
    }

    const top = 20 + index * 340;
    return `<div style="position:absolute;left:20px;top:${top}px;width:${PAGE_WIDTH - 40}px;">
      ${el.label ? `<div style="font-size:12px;color:#666;margin-bottom:4px;">${escapeHtml(el.label)}</div>` : ''}
      ${html}
    </div>`;
  });

  const totalHeight = Math.max(PAGE_HEIGHT, 20 + elements.length * 340 + 20);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #333; }
    @page { size: A4; margin: 0; }
  </style>
</head>
<body>
  <div style="position:relative;width:${PAGE_WIDTH}px;min-height:${totalHeight}px;margin:0 auto;padding:0;">
    ${renderedElements.join('\n    ')}
  </div>
</body>
</html>`;
}

module.exports = { renderTemplate };
