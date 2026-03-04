const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists for SQLite
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database (creates tables + seeds data)
require('./db');

const templatesRouter = require('./routes/templates');
const datasetsRouter = require('./routes/datasets');
const schedulesRouter = require('./routes/schedules');
const reportsRouter = require('./routes/reports');
const { start: startCron } = require('./cron');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/templates', templatesRouter);
app.use('/api/datasets', datasetsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/reports', reportsRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  startCron();
});
