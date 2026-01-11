import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Activity as ActivityIcon, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Clock, 
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { groupsApi, Activity } from '../services/api';
import { format } from 'date-fns';

const CHART_COLORS = ['#FF6B35', '#FF8C5A', '#CC4E14', '#E0E0E0', '#4A4A4A'];

const GroupPerformance = () => {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return toast.error('INVALID_GROUP_CODE');

    setLoading(true);
    try {
      const [lRes, aRes] = await Promise.all([
        groupsApi.getGroupLeaderboard(code),
        groupsApi.getGroupActivities(code)
      ]);
      setStats(lRes.data);
      setActivities(aRes.data);
      setIsAuthenticated(true);
      toast.success(`GROUP_SYNC: ${code} CONNECTED`);
    } catch (err: any) {
      toast.error('GROUP_NOT_FOUND_OR_EMPTY');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setStats(null);
    setActivities([]);
    setCode('');
  };

  const dailyData = activities.slice(0, 10).reverse().map(a => ({
    date: format(new Date(a.createdAt), 'dd/MM'),
    distance: a.distance || 0,
    participant: a.participantName
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
          className="industrial-panel p-12 max-w-md w-full border-r-4 border-r-[#FF6B35]"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-full">
                <Users size={48} className="text-[#FF6B35]" />
              </div>
            </div>
            <div>
              <div className="tech-label text-[#FF6B35]">SQUADRON_SYNC</div>
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">GROUP_PERFORMANCE</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="tech-label text-white">GROUP_CODE (e.g. 1000)</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="ENTER_GROUP_ID"
                  className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-6 text-white text-center text-4xl font-black tracking-[0.2em] focus:border-[#FF6B35] outline-none transition-all uppercase"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-safety w-full py-5 flex items-center justify-center gap-4 text-xl"
              >
                {loading ? 'SEARCHING...' : 'ACCESS_DATA'}
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
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#FF6B35] pb-6 gap-4">
        <div>
          <div className="tech-label text-[#FF6B35]">SQUADRON_ID: {stats?.groupCode}</div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase">GROUP_OVERVIEW</h1>
        </div>
        <button onClick={logout} className="text-xs font-bold text-gray-500 hover:text-white">
          EXIT_VIEW
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'SQUAD_MEMBERS', val: stats?.totalMembers, icon: Users, highlight: true },
          { label: 'TOTAL_DISTANCE', val: `${stats?.totalDistance.toFixed(1)} KM`, icon: TrendingUp },
          { label: 'TOTAL_DURATION', val: `${stats?.totalDuration} MIN`, icon: Clock },
          { label: 'TOTAL_POINTS', val: `${stats?.totalPoints.toLocaleString()}`, icon: Zap },
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Charts */}
        <div className="lg:col-span-8 industrial-panel p-8">
          <div className="tech-label text-[#FF6B35] mb-8">GROUP_ACTIVITY_TREND</div>
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
                <Bar dataKey="distance" fill="#FF6B35" name="DISTANCE_KM" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers (Mini Leaderboard) */}
        <div className="lg:col-span-4 industrial-panel p-0 overflow-hidden">
          <div className="p-6 bg-[#1A1A1A] border-b border-[#2D2D2D]">
            <div className="tech-label text-[#FF6B35]">TOP_OPERATIVES</div>
          </div>
          <div className="divide-y divide-[#2D2D2D]">
            {stats?.leaderboard?.slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-[#262626] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 text-sm font-black text-gray-500">0{i + 1}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.individualCode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#FF6B35]">{p.totalPoints}</div>
                  <div className="text-[8px] text-gray-600 font-bold tracking-widest">PTS</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="industrial-panel overflow-hidden border-l-4 border-l-[#FF6B35]">
        <div className="p-4 bg-[#1A1A1A] border-b border-[#2D2D2D] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-[#FF6B35]" size={18} />
            <h3 className="text-sm font-bold tracking-widest uppercase">GROUP_LOGS</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2D2D2D] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="p-4">DATE</th>
                <th className="p-4">OPERATIVE</th>
                <th className="p-4">ACTIVITY</th>
                <th className="p-4">METRICS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {activities.map((a, i) => (
                <tr key={i} className="hover:bg-[#0D0D0D] transition-colors">
                  <td className="p-4 font-mono text-xs text-white">
                    {format(new Date(a.createdAt), 'dd/MM HH:mm')}
                  </td>
                  <td className="p-4 text-xs font-bold text-white">{a.participantName}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-[#1A1A1A] border border-[#2D2D2D] text-[10px] font-bold text-[#FF6B35]">
                      {a.activityType.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-400">
                    {a.distance > 0 ? `${a.distance}KM` : `${a.duration}MIN`}
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

export default GroupPerformance;
