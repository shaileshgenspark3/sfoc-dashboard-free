import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Trophy, 
  Activity as ActivityIcon, 
  Clock, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ActivityFeed from '../components/ActivityFeed';
import ActivityCharts from '../components/ActivityCharts';
import ImpactVisualizer from '../components/ImpactVisualizer';
import Confetti from '../components/Confetti';
import { activitiesApi, Stats, Activity } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 0,
    todayActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
    totalPoints: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState(false);

  useEffect(() => {
    fetchData();

    // Determine WebSocket URL based on environment
    // For development, connect directly to the backend WebSocket server
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = window.location.hostname === 'localhost' ? 'localhost:5000' : `${window.location.hostname}:5000`;
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${backendHost}`;
    const ws = new WebSocket(wsHost);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_activity') {
          setNewActivity(true);
          setTimeout(() => setNewActivity(false), 2000);
          fetchData();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    return () => ws.close();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        activitiesApi.getStats(),
        activitiesApi.getToday(),
      ]);
      
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <Confetti trigger={newActivity} />
      
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-12">
        <div className="absolute top-0 left-0 w-12 h-12 md:w-24 md:h-24 border-t-2 border-l-2 border-[#3F3F3F]" />
        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-24 md:h-24 border-b-2 border-r-2 border-[#3F3F3F]" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="px-2 md:px-3 py-1 bg-[#262626] border border-[#3F3F3F] text-[#8C8C8C] text-[8px] md:text-[10px] font-bold tracking-[0.2em]">
                STATUS: ACTIVE_CHALLENGE
              </div>
              <div className="px-2 md:px-3 py-1 bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] text-[8px] md:text-[10px] font-bold tracking-[0.2em]">
                PHASE: 01_JAN_FEB_2026
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white break-words">
              FIT-O-CHARITY <br />
              <span className="text-[#FF6B35]">BY_SUKRUT_PARIVAR</span>
            </h1>

            <p className="text-base md:text-lg text-[#8C8C8C] max-w-xl font-medium leading-relaxed">
              Tactical fitness tracking for the elite performer. Log your daily output, monitor system-wide metrics, and dominate the ranking protocols.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/submit" className="w-full sm:w-auto">
                <button className="btn-safety w-full flex items-center justify-center gap-3 py-4 sm:py-3 px-8">
                  <Zap size={20} fill="currentColor" />
                  INITIATE_LOG
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/leaderboard" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 sm:py-3 bg-[#262626] border border-[#3F3F3F] text-white font-bold uppercase tracking-wider hover:border-[#FF6B35] transition-colors flex items-center justify-center gap-3">
                  <Trophy size={18} />
                  RANK_PROTOCOLS
                </button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="industrial-panel p-8 diagonal-bg min-h-[300px] flex flex-col justify-center border-l-4 border-l-[#FF6B35]">
              <div className="space-y-8">
                <div>
                  <div className="tech-label mb-2">SYSTEM_CLOCK</div>
                  <div className="text-4xl font-bold text-white tracking-tighter">
                    {new Date().toLocaleTimeString('en-US', { hour12: false })}
                  </div>
                </div>
                <div>
                  <div className="tech-label mb-2">LIVE_SENSORS</div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 bg-[#2ECC71] rounded-full animate-pulse" />
                    <span className="text-xs font-bold tracking-widest text-[#2ECC71]">DATA_FLOW_STABLE</span>
                  </div>
                </div>
                <div>
                  <div className="tech-label mb-2">CHALLENGE_PROGRESS</div>
                  <div className="w-full h-1 bg-[#3F3F3F]">
                    <div className="h-full bg-[#FF6B35] w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Impact Visualizer */}
      <section>
        <ImpactVisualizer totalPoints={stats?.totalPoints || 0} />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          title="PARTICIPANTS"
          value={stats.totalParticipants}
          unit="UNITS"
          delay={0.1}
        />
        <StatsCard
          icon={ActivityIcon}
          title="DAILY_CYCLES"
          value={stats.todayActivities}
          unit="LOGS"
          delay={0.2}
        />
        <StatsCard
          icon={TrendingUp}
          title="NET_DISTANCE"
          value={(stats.totalDistance || 0).toFixed(1)}
          unit="KM"
          delay={0.3}
        />
        <StatsCard
          icon={Clock}
          title="OPERATIONAL_TIME"
          value={formatDuration(stats.totalDuration || 0)}
          unit="T_TOTAL"
          delay={0.4}
        />
      </section>

      {/* Analytics Visualization */}
      <section>
        <ActivityCharts activities={activities} />
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ActivityFeed activities={activities} />
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <div className="industrial-panel p-6 border-l-4 border-l-[#FF6B35]">
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#FF6B35]" size={20} />
              <h3 className="text-xl">SYSTEM_GUIDE</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { id: '01', title: "SECURE_AUTH", desc: "Access via unique participant ID" },
                { id: '02', title: "EXECUTE_MOTION", desc: "Perform validated activity types" },
                { id: '03', title: "SYNC_METRICS", desc: "Upload logs before 1800H daily" }
              ].map((item) => (
                <div key={item.id} className="group p-4 bg-[#1F1F1F] border border-[#3F3F3F] hover:border-[#FF6B35]/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="text-[#FF6B35] font-black text-lg leading-none">{item.id}</span>
                    <div>
                      <h4 className="text-xs font-bold tracking-widest text-[#E5E5E5] mb-1">{item.title}</h4>
                      <p className="text-[10px] text-[#8C8C8C] leading-normal">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="industrial-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-[#8C8C8C]" size={20} />
              <h3 className="text-xl">SPECIFICATIONS</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#3F3F3F]">
                <span className="text-[10px] font-bold text-[#8C8C8C]">ALLOWED_MODES</span>
                <span className="text-[10px] font-bold text-white">WALK/RUN/CYCLE/YOGA/GYM</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#3F3F3F]">
                <span className="text-[10px] font-bold text-[#8C8C8C]">SYNC_INTERVAL</span>
                <span className="text-[10px] font-bold text-white">24H / REALTIME_WS</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#3F3F3F]">
                <span className="text-[10px] font-bold text-[#8C8C8C]">ENFORCEMENT</span>
                <span className="text-[10px] font-bold text-[#FF6B35]">STRICT_LOG_PROTOCOLS</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
