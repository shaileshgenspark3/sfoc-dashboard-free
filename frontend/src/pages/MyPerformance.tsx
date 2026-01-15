import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
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
  Zap,
  ChevronRight,
  Target,
  Medal,
  Camera,
  Share2
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
import { activitiesApi, participantsApi, Participant, Activity, stravaApi } from '../services/api';
import { format, isToday } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { BadgesList } from '../components/BadgesList';
import { AchievementPopup } from '../components/AchievementPopup';
import { SocialShareCard } from '../components/SocialShareCard';
import { getAssetUrl } from '../utils/urlHelper';

const CHART_COLORS = ['#FF6B35', '#FF8C5A', '#CC4E14', '#E0E0E0', '#4A4A4A'];

const MyPerformance = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [generatingShare, setGeneratingShare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stravaStatus = searchParams.get('strava');
    if (stravaStatus === 'success') {
      toast.success('STRAVA_UPLINK: CONNECTION_ESTABLISHED');
    } else if (stravaStatus === 'error') {
      toast.error('STRAVA_UPLINK: CONNECTION_FAILED');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return toast.error('OPERATIVE_CODE_REQUIRED');

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
      toast.error('OPERATIVE_NOT_FOUND_IN_REGISTRY');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !participant) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('FILE_SIZE_EXCEEDED: MAX_5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingProfile(true);
    try {
      const res = await participantsApi.uploadProfilePicture(participant.individualCode, formData);
      if (res.data.success) {
        setParticipant(prev => prev ? { ...prev, profilePicture: res.data.profilePicture } : null);
        toast.success('PROFILE_IMAGE_UPDATED');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'TRANSMISSION_ERROR';
      toast.error(`UPLOAD_FAILED: ${errorMsg}`);
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setGeneratingShare(true);
    toast.loading('GENERATING_SOCIAL_CARD...', { id: 'share' });

    try {
      // Small delay to ensure render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `FIT-O-CHARITY_${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = image;
      link.click();
      
      toast.success('DOWNLOAD_COMPLETE: READY_FOR_UPLOAD', { id: 'share' });
    } catch (err) {
      console.error(err);
      toast.error('GENERATION_FAILED', { id: 'share' });
    } finally {
      setGeneratingShare(false);
    }
  };

  const handleStravaConnect = async () => {
    if (!participant) return;
    try {
      const res = await stravaApi.getAuthUrl(participant.individualCode);
      window.location.href = res.data.url;
    } catch (err) {
      toast.error('STRAVA_AUTH_INITIALIZATION_FAILED');
    }
  };

  const handleStravaSync = async () => {
    if (!participant) return;
    setSyncing(true);
    try {
      const res = await stravaApi.sync(participant.individualCode);
      if (res.data.syncedCount > 0) {
        toast.success(`SYNC_COMPLETE: ${res.data.syncedCount}_NEW_ACTIVITIES`);
        // Refresh data
        const aRes = await activitiesApi.getByParticipant(participant.individualCode);
        setActivities(aRes.data);
        
        // Check for new badges
        if (res.data.newBadges && res.data.newBadges.length > 0) {
          setNewBadges(res.data.newBadges);
          // Also refresh participant to show badges in list
          const pRes = await participantsApi.getByCode(participant.individualCode);
          setParticipant(pRes.data);
        }
      } else {
        toast.success('SYNC_COMPLETE: NO_NEW_DATA');
      }
    } catch (err) {
      toast.error('STRAVA_SYNC_FAILED');
    } finally {
      setSyncing(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setParticipant(null);
    setActivities([]);
    setCode('');
  };

  const dailyData = activities.slice(0, 10).reverse().map(a => ({
    date: format(new Date(a.createdAt), 'dd/MM'),
    distance: a.distance || 0,
    duration: a.duration || 0,
    points: a.points || 0
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
          className="industrial-panel p-8 md:p-12 max-w-md w-full border-l-4 border-l-[#FF6B35]"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-full shadow-[0_0_20px_rgba(255,107,53,0.2)]">
                <User size={48} className="text-[#FF6B35]" />
              </div>
            </div>
            <div>
              <div className="tech-label text-[#FF6B35] mb-1">UPLINK_PORTAL: PERSONAL_METRICS</div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">MY_PERFORMANCE</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="tech-label text-white">OPERATIVE_UID</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="ENTER_CODE"
                  className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-5 md:p-6 text-white text-center text-3xl md:text-4xl font-black tracking-[0.3em] focus:border-[#FF6B35] outline-none transition-all uppercase placeholder:text-[#1A1A1A]"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-safety w-full py-5 flex items-center justify-center gap-4 text-xl shadow-[8px_8px_0px_0px_#000]"
              >
                {loading ? 'SYNCING...' : 'ESTABLISH_UPLINK'}
                {!loading && <Search size={24} />}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 md:py-12">
      <AchievementPopup badges={newBadges} onClose={() => setNewBadges([])} />
      {/* Mobile-Friendly Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#FF6B35] pb-6 gap-4 px-2">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 border-[#FF6B35] bg-black relative">
              {participant?.profilePicture ? (
                <img 
                  src={getAssetUrl(participant.profilePicture)}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                  <User size={40} className="text-[#FF6B35]" />
                </div>
              )}
              {uploadingProfile && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent animate-spin rounded-full" />
                </div>
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-[#FF6B35] text-black hover:bg-white transition-colors shadow-lg"
              disabled={uploadingProfile}
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleProfileUpload}
            />
          </div>

          <div className="space-y-1">
            <div className="tech-label text-[#FF6B35]">OPERATIVE_PROFILE: {participant?.individualCode}</div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase truncate">
              {participant?.name}
            </h1>
          </div>
          
          <div className="flex gap-2 pb-1">
            <button 
              onClick={handleStravaConnect}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FC4C02] text-white text-[10px] font-black hover:bg-[#E34402] transition-colors uppercase tracking-widest"
            >
              <Zap size={14} fill="currentColor" />
              CONNECT_STRAVA
            </button>
            <button 
              onClick={handleStravaSync}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#FC4C02] text-[#FC4C02] text-[10px] font-black hover:bg-[#FC4C02] hover:text-white transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {syncing ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <TrendingUp size={14} />
              )}
              SYNC_DATA
            </button>
            <button
              onClick={handleShare}
              disabled={generatingShare}
              className="flex items-center gap-2 px-3 py-1.5 border border-neon-green text-neon-green text-[10px] font-black hover:bg-neon-green hover:text-black transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {generatingShare ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <Share2 size={14} />
              )}
              SHARE_STATS
            </button>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-[#3F3F3F] text-[10px] font-black text-[#8C8C8C] hover:text-white hover:border-[#FF6B35] transition-all uppercase tracking-widest bg-[#1A1A1A]/50"
        >
          <ArrowLeft size={14} />
          TERMINATE_SESSION
        </button>
      </header>

      {/* Stats Grid - 2 Column on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'POINTS', val: `${(participant?.totalPoints || 0).toLocaleString()}`, icon: Zap, highlight: true },
          { label: 'STREAK', val: `${participant?.streakDays} DAYS`, icon: Flame },
          { label: 'DISTANCE', val: `${participant?.totalDistance.toFixed(1)} KM`, icon: TrendingUp },
          { label: 'DURATION', val: `${participant?.totalDuration} MIN`, icon: Clock },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`industrial-panel p-4 md:p-6 border-l-2 md:border-l-4 ${stat.highlight ? 'border-l-[#FF6B35] bg-[#FF6B35]/5' : 'border-l-[#3F3F3F]'}`}
          >
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="tech-label text-[8px] md:text-[10px]">{stat.label}</div>
              <stat.icon size={16} className={stat.highlight ? 'text-[#FF6B35]' : 'text-[#4A4A4A]'} />
            </div>
            <div className="text-xl md:text-3xl font-black text-white tracking-tighter truncate">{stat.val}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Performance Trend Chart */}
        <div className="lg:col-span-8 industrial-panel p-4 md:p-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <TrendingUp size={18} className="text-[#FF6B35]" />
            <div className="tech-label text-[#FF6B35]">ACTIVITY_DYNAMICS: LAST_10_CYCLES</div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 107, 53, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #FF6B3533', borderRadius: '0px' }}
                  itemStyle={{ color: '#FF6B35', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="distance" fill="#FF6B35" name="KM" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modality Pie Chart */}
        <div className="lg:col-span-4 industrial-panel p-6 md:p-8 flex flex-col items-center">
          <div className="w-full flex items-center gap-3 mb-6">
            <Target size={18} className="text-[#FF6B35]" />
            <div className="tech-label text-[#FF6B35]">MODALITY_MIX</div>
          </div>
          <div className="h-[200px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {typeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #FF6B3533', borderRadius: '0px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
            {typeDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-[9px] font-black text-gray-500 uppercase truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="industrial-panel p-4 md:p-8 border-l-2 md:border-l-4 border-l-neon-green/80 bg-neon-green/5">
        <div className="flex items-center gap-3 mb-6">
          <Medal size={20} className="text-neon-green" />
          <div className="tech-label text-neon-green">TACTICAL_MEDALS: ACHIEVEMENT_PROTOCOL</div>
        </div>
        <BadgesList earnedBadges={participant?.badges || []} />
      </div>

      {/* Activity Log - Better for Mobile */}
      <div className="industrial-panel border-l-2 md:border-l-4 border-l-[#FF6B35] overflow-hidden">
        <div className="p-4 bg-[#1A1A1A] border-b border-[#2D2D2D] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-[#FF6B35]" size={18} />
            <h3 className="text-xs font-black tracking-widest uppercase">TRANSACTION_LOG</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-600">RECORDS: {activities.length}</span>
        </div>
        
        {/* Card-style log for mobile, table for desktop */}
        <div className="hidden md:block overflow-x-auto">
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
                    {a.distance > 0 ? `${a.distance}KM` : `${a.duration}MIN`} | {a.points} PTS
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[9px] font-black text-[#2ECC71]">
                      <div className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full animate-pulse" />
                      SYNC_VERIFIED
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Log View */}
        <div className="md:hidden divide-y divide-[#1A1A1A]">
          {activities.map((a, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-white flex items-center gap-2">
                  <ActivityIcon size={12} className="text-[#FF6B35]" />
                  {a.activityType.toUpperCase()}
                </div>
                <div className="text-[9px] font-bold text-[#4A4A4A] tracking-tighter uppercase">
                  {format(new Date(a.createdAt), 'MMM dd | HH:mm')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#FF6B35]">
                  {a.distance > 0 ? `${a.distance}KM` : `${a.duration}MIN`}
                </div>
                <div className="text-[8px] font-black text-[#2ECC71] uppercase">+{a.points} PTS</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Share Card for Generation */}
      {participant && (
        <div className="fixed left-[-9999px] top-[-9999px]">
          <SocialShareCard 
            ref={shareCardRef}
            participant={participant}
            todayActivities={activities.filter(a => isToday(new Date(a.createdAt)))}
          />
        </div>
      )}
    </div>
  );
};

export default MyPerformance;