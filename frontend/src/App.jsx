import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorSearch from './pages/DonorSearch';
import BloodRequests from './pages/BloodRequests';
import Inventory from './pages/Inventory';
import EmergencySOS from './pages/EmergencySOS';
import DonationCamps from './pages/DonationCamps';
import PatientIssuanceLog from './pages/PatientIssuanceLog';
import DonorTracking from './pages/DonorTracking';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminPortal from './pages/AdminPortal';
import RoleDashboard from './pages/RoleDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const location = useLocation();
  const isAdminPath = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdminPath && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/camps" element={<DonationCamps />} />
          <Route path="/emergency-sos" element={<EmergencySOS />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donors" element={<DonorSearch />} />
          <Route path="/requests" element={<BloodRequests />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/issuance-log" element={<PatientIssuanceLog />} />
          <Route path="/donor-tracking" element={<DonorTracking />} />
          <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
