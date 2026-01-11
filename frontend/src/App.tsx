import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SubmitActivity from './pages/SubmitActivity';
import GroupDashboard from './pages/GroupDashboard';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import MyPerformance from './pages/MyPerformance';
import GroupPerformance from './pages/GroupPerformance';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="min-h-screen relative bg-[#050505]">
        <div className="mesh-bg fixed inset-0 pointer-events-none" />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(26, 26, 26, 0.95)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              borderRadius: '0px',
              border: '1px solid #FF6B35',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '0.1em'
            },
          }}
        />
        <Navbar />
        <div className="container mx-auto px-4 pb-24 lg:pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitActivity />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/group-performance" element={<GroupPerformance />} />
            <Route path="/group/:groupCode" element={<GroupDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/my-performance" element={<MyPerformance />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
