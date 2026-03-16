import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { ClubsDirectory } from './pages/ClubsDirectory';
import { MasterCalendar } from './pages/MasterCalendar';
import { AdminPortal } from './pages/AdminPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { EventPage } from './pages/EventPage';
import { ClubPage } from './pages/ClubPage';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clubs" element={<ClubsDirectory />} />
              <Route path="/clubs/:id" element={<ClubPage />} />
              <Route path="/calendar" element={<MasterCalendar />} />
              <Route path="/events/:id" element={<EventPage />} />
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
