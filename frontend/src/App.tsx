import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SubmitActivity from './pages/SubmitActivity';
import GroupDashboard from './pages/GroupDashboard';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import MyPerformance from './pages/MyPerformance';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen relative">
        <div className="mesh-bg fixed inset-0 pointer-events-none" />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <div className="container mx-auto px-4 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitActivity />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/group/:groupCode" element={<GroupDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/my-performance" element={<MyPerformance />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
