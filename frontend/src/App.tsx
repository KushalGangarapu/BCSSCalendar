import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './components/Toast';
import { DataProvider } from './context/DataContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Dashboard } from './pages/Dashboard';
import { ClubsDirectory } from './pages/ClubsDirectory';
import { MasterCalendar } from './pages/MasterCalendar';
import { AdminPortal } from './pages/AdminPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { EventPage } from './pages/EventPage';
import { ClubPage } from './pages/ClubPage';
import { useEffect } from 'react';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { Helmet } from 'react-helmet-async';
import { prefetchAllCoreData } from './utils/apiCache';

function App() {
  useEffect(() => {
    prefetchAllCoreData();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <DataProvider>
        <ToastProvider>
        <Helmet>
          <title>BCSS Calendar</title>
        </Helmet>
        <div className="app-layout">
          <Navbar />
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
          <PwaInstallBanner />
        </div>
      </ToastProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
