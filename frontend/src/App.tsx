import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import ClientPortal from './pages/ClientPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/coordinator/*" element={<CoordinatorDashboard />} />
          <Route path="/specialist/*" element={<SpecialistDashboard />} />
          <Route path="/client/*" element={<ClientPortal />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
