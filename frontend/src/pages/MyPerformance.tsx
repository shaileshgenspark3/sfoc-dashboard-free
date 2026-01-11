import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  User, 
  Search, 
  Activity as ActivityIcon, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ArrowLeft,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { activitiesApi, participantsApi, Participant, Activity } from '../services/api';
import { format } from 'date-fns';

const BRAND_ORANGE = '#FF6B35';
const CHART_COLORS = ['#FF6B35', '#FF8C5A', '#CC4E14', '#E0E0E0', '#4A4A4A'];

const MyPerformance = () => {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error('INVALID_CODE: MUST_BE_6_CHARACTERS');

    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        participantsApi.getByCode(code),
        activitiesApi.getByParticipant(code)
      ]);
      setParticipant(pRes.data);
      setActivities(aRes.data);
      setIsAuthenticated(true);
      toast.success('UPLINK_ESTABLISHED: PROFILE_SYNC_COMPLETE');
    } catch (err: any) {
      toast.error(err.message || 'SYNC_FAILED: OPERATIVE_NOT_FOUND');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setParticipant(null);
    setActivities([]);
    setCode('');
  };

  // Process data for charts
  const dailyData = activities.slice(0, 7).reverse().map(a => ({
    date: format(new Date(a.createdAt), 'dd/MM'),
    distance: a.distance || 0,
    duration: a.duration || 0
  }));

  const typeDistribution = activities.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.activityType);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: curr.activityType, value: 1 });
    }
    return acc;
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="industrial-panel p-12 max-w-md w-full border-l-4 border-l-[#FF6B35]"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-full">
                <User size={48} className="text-[#FF6B35]" />
              </div>
            </div>
            <div>
              <div className="tech-label text-[#FF6B35]">UPLINK_PORTAL: OPERATIVE_SYNC</div>
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">MY_PERFORMANCE</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="tech-label text-white">OPERATIVE_CODE</label>
                <input 
                  type="text" 
                  maxLength={6}
                  autoFocus
                  placeholder="ENTER_UID"
                  className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-6 text-white text-center text-4xl font-black tracking-[0.5em] focus:border-[#FF6B35] outline-none transition-all uppercase"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-safety w-full py-5 flex items-center justify-center gap-4 text-xl"
              >
                {loading ? 'SYNCING...' : 'ESTABLISH_CONNECTION'}
                {!loading && <Search size={24} />}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#FF6B35] pb-6 gap-4">
        <div>
          <div className="tech-label text-[#FF6B35]">OPERATIVE_PROFILE: {participant?.individualCode}</div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase">{participant?.name}</h1>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          TERMINATE_SESSION
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL_POINTS', val: `${(participant?.totalPoints || 0).toLocaleString()} PTS`, icon: Zap, highlight: true },
          { label: 'TOTAL_DISTANCE', val: `${participant?.totalDistance.toFixed(1)} KM`, icon: TrendingUp },
          { label: 'TOTAL_DURATION', val: `${participant?.totalDuration} MIN`, icon: Clock },
          { label: 'CURRENT_STREAK', val: `${participant?.streakDays} DAYS`, icon: Flame },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`industrial-panel p-6 border-l-4 ${stat.highlight ? 'border-l-[#FF6B35] bg-[#FF6B35]/5' : 'border-l-gray-800'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="tech-label">{stat.label}</div>
              <stat.icon size={18} className={stat.highlight ? 'text-[#FF6B35]' : 'text-gray-600'} />
            </div>
            <div className="text-3xl font-black text-white tracking-tighter">{stat.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Trend */}
        <div className="lg:col-span-8 industrial-panel p-8">
          <div className="tech-label text-[#FF6B35] mb-8">PERFORMANCE_HISTORY: RECENT_CYCLES</div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 107, 53, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #FF6B3533', borderRadius: '0px' }}
                  itemStyle={{ color: '#FF6B35', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="distance" 
                  fill="#FF6B35" 
                  name="DISTANCE_KM" 
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modality Split */}
        <div className="lg:col-span-4 industrial-panel p-8">
          <div className="tech-label text-[#FF6B35] mb-8">MODALITY_DYNAMICS</div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #FF6B3533', borderRadius: '0px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {typeDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-500 uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="industrial-panel overflow-hidden border-l-4 border-l-[#FF6B35]">
        <div className="p-4 bg-[#1A1A1A] border-b border-[#2D2D2D] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-[#FF6B35]" size={18} />
            <h3 className="text-sm font-bold tracking-widest uppercase">TRANSACTION_LOG</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-600">TOTAL_RECORDS: {activities.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2D2D2D] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="p-4">TIMESTAMP</th>
                <th className="p-4">MODALITY</th>
                <th className="p-4">METRICS</th>
                <th className="p-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {activities.map((a, i) => (
                <tr key={i} className="hover:bg-[#0D0D0D] transition-colors">
                  <td className="p-4 font-mono text-xs text-white">
                    {format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-[#1A1A1A] border border-[#2D2D2D] text-[10px] font-bold text-[#FF6B35]">
                      {a.activityType.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-400">
                    {a.distance}KM | {a.duration}MIN
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#2ECC71]">
                      <div className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full animate-pulse" />
                      VERIFIED
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyPerformance;
