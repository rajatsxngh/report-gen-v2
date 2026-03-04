import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TemplateBuilder from './pages/TemplateBuilder';
import DataConnector from './pages/DataConnector';
import Scheduler from './pages/Scheduler';
import Reports from './pages/Reports';

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<TemplateBuilder />} />
          <Route path="/templates/:id" element={<TemplateBuilder />} />
          <Route path="/data" element={<DataConnector />} />
          <Route path="/schedules" element={<Scheduler />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
