# ReportGen — Automated Report Generator

## What it does
A web application where users design report templates, connect mock data sources, schedule recurring reports, and get PDF output delivered via email.

## Core Features

### 1. Template Builder
A drag-and-drop interface where users add elements (bar charts, line charts, tables, text blocks, headers) onto a report canvas. Users can save and load templates.

### 2. Data Connector
The app comes with built-in mock datasets (sales data, user metrics, inventory). Users pick which dataset feeds into their template. Each chart/table element binds to a specific data field.

### 3. Scheduler
Users configure when a report runs (daily, weekly, monthly) and at what time. The scheduler shows upcoming runs and a log of past runs.

### 4. PDF Generation & Delivery
When a report runs (manually or on schedule), the app renders the template with live data into a PDF. The PDF can be downloaded or "sent" via email (simulated for the prototype).

### 5. Dashboard
A home screen showing all configured reports, their schedules, last run status, and quick actions (run now, edit, delete).

## Tech Stack
- React frontend
- Node.js / Express backend
- SQLite for storage
- Mock data built in
- Monorepo structure

