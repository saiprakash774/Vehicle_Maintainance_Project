import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import SchedulerPage from './pages/SchedulerPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}
