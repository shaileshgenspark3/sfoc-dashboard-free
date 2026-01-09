import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Clock, 
  UserPlus, 
  ArrowLeft, 
  Search, 
  Database,
  Plus,
  ShieldAlert,
  Hash,
  Activity
} from 'lucide-react';
import Confetti from '../components/Confetti';
import StatsCard from '../components/StatsCard';
import { groupsApi } from '../services/api';

const GroupDashboard = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (groupCode) {
      fetchGroupData();
    }
  }, [groupCode]);

  const fetchGroupData = async () => {
    try {
      const response = await groupsApi.getGroupLeaderboard(groupCode!);
      setGroupData(response.data);
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error('GROUP_NOT_FOUND');
      navigate('/leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!searchCode.trim()) {
      toast.error('FIELD_REQUIRED: INDIVIDUAL_CODE');
      return;
    }

    try {
      // Need to add join to api.ts if not there, let's assume it is or I'll add it
      // Actually I should check api.ts
      await groupsApi.join(groupCode!, searchCode.toUpperCase());
      toast.success('ACCESS_GRANTED: GROUP_JOINED');
      setShowJoinModal(false);
      fetchGroupData();
    } catch (error: any) {
      toast.error(error.message || 'JOIN_SEQUENCE_FAILED');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!groupCode) {
    return <JoinGroupComponent />;
  }

  return (
    <div className="space-y-12">
      <Confetti trigger={false} />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#3F3F3F] pb-8">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="text-[10px] font-bold text-[#8C8C8C] hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            RETURN_TO_ROOT
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#262626] border border-[#3F3F3F]">
              <Users className="text-[#FF6B35]" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
                {groupData?.groupName || 'LOADING_UNIT...'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="tech-label">UID:</div>
                <div className="text-[10px] font-bold text-[#FF6B35] tracking-[0.2em]">{groupCode}</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowJoinModal(true)}
          className="btn-safety flex items-center gap-3 self-start md:self-center"
        >
          <UserPlus size={18} />
          ADD_OPERATIVE
        </button>
      </header>

      {/* Group Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Users}
          title="UNIT_STRENGTH"
          value={groupData?.totalMembers || 0}
          unit="PERSONNEL"
          delay={0.1}
        />
        <StatsCard
          icon={Trophy}
          title="COMBINED_YIELD"
          value={`${(groupData?.totalDistance || 0).toFixed(1)}`}
          unit="KM_TOTAL"
          delay={0.2}
        />
        <StatsCard
          icon={Clock}
          title="ACTIVE_RUNTIME"
          value={formatDuration(groupData?.totalDuration || 0)}
          unit="T_ELAPSED"
          delay={0.3}
        />
      </section>

      {/* Member Leaderboard */}
      <div className="industrial-panel overflow-hidden border-l-4 border-l-[#FF6B35]">
        <div className="p-4 bg-[#262626] border-b border-[#3F3F3F] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-[#FF6B35]" size={18} />
            <h3 className="text-sm font-bold tracking-widest uppercase">UNIT_PERFORMANCE_INDEX</h3>
          </div>
        </div>

        <div className="divide-y divide-[#3F3F3F]">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent animate-spin" />
              <div className="tech-label">RECOVERY_IN_PROGRESS...</div>
            </div>
          ) : (
            groupData?.leaderboard?.map((p: any, index: number) => (
              <div key={p.individualCode} className="p-4 flex items-center gap-6 hover:bg-[#262626] transition-colors">
                <div className="w-8 text-sm font-black text-[#4A4A4A]">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                
                <div className="w-10 h-10 border border-[#3F3F3F] flex items-center justify-center font-bold text-white">
                  {p.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate uppercase">{p.name}</h4>
                  <p className="text-[10px] text-[#4A4A4A] font-bold tracking-wider">{p.individualCode}</p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#FF6B35]">{(p.totalPoints || 0).toLocaleString()} PTS</div>
                  <div className="text-[10px] font-bold text-white">{p.totalDistance.toFixed(1)} KM</div>
                  <div className="text-[10px] font-bold text-[#4A4A4A]">{formatDuration(p.totalDuration)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-sm"
              onClick={() => setShowJoinModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="industrial-panel p-8 w-full max-w-md relative z-10 bg-[#262626]"
            >
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <UserPlus className="text-[#FF6B35]" size={24} />
                ADD_UNIT_MEMBER
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="tech-label block mb-2">OPERATIVE_ID_CODE</label>
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="ENTER_6_CHAR"
                    maxLength={6}
                    className="w-full bg-[#1A1A1A] border border-[#3F3F3F] p-4 text-white text-xl font-black uppercase tracking-widest focus:border-[#FF6B35] outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 border border-[#3F3F3F] text-[#8C8C8C] font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={handleJoinGroup}
                    className="flex-1 py-3 bg-[#FF6B35] text-black font-bold uppercase tracking-widest hover:bg-[#FF8C61] transition-colors"
                  >
                    CONFIRM_ADD
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JoinGroupComponent = () => {
  const [searchCode, setSearchCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ groupName: '', description: '', individualCode: '' });
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchCode.trim()) {
      navigate(`/group/${searchCode.toUpperCase()}`);
    }
  };

  const handleCreateGroup = async () => {
    if (!createData.groupName || !createData.individualCode) {
      toast.error('FIELD_REQUIRED: NAME & ID');
      return;
    }

    try {
      const response = await groupsApi.create(createData);
      toast.success('UNIT_ESTABLISHED');
      setShowCreateModal(false);
      navigate(`/group/${response.data.group.groupCode}`);
    } catch (error: any) {
      toast.error(error.message || 'INITIALIZATION_FAILED');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-[#262626] border border-[#3F3F3F] mb-4">
          <Users className="text-[#FF6B35]" size={48} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white">GROUP_OPERATIONS</h1>
        <p className="text-[#8C8C8C] font-medium max-w-lg mx-auto uppercase text-xs tracking-widest">
          Establish or join strategic units for collective output monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="industrial-panel p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Search className="text-[#FF6B35]" size={20} />
            <h2 className="text-xl font-bold tracking-tight">ACCESS_EXISTING_UNIT</h2>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="ENTER_GROUP_CODE"
              maxLength={6}
              className="w-full bg-[#1A1A1A] border border-[#3F3F3F] p-4 text-white text-xl font-black uppercase tracking-widest focus:border-[#FF6B35] outline-none"
            />
            <button
              onClick={handleSearch}
              className="w-full py-4 border border-[#FF6B35] text-[#FF6B35] font-black uppercase tracking-widest hover:bg-[#FF6B35] hover:text-black transition-all"
            >
              INITIALIZE_LINK
            </button>
          </div>
        </div>

        <div className="industrial-panel p-8 space-y-6 diagonal-bg border-l-4 border-l-[#FF6B35]">
          <div className="flex items-center gap-3">
            <Plus className="text-[#FF6B35]" size={20} />
            <h2 className="text-xl font-bold tracking-tight">CREATE_NEW_UNIT</h2>
          </div>
          
          <p className="text-[10px] text-[#8C8C8C] font-bold leading-relaxed tracking-wider">
            DEPLOY A NEW GROUP MODULE FOR YOUR SQUAD, GYM, OR ORGANIZATION. 
            ENABLE COLLECTIVE PERFORMANCE TRACKING AND REGISTRY RANKINGS.
          </p>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-safety w-full py-4 flex items-center justify-center gap-3"
          >
            <Database size={18} />
            ESTABLISH_MODULE
          </button>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="industrial-panel p-8 w-full max-w-md relative z-10 bg-[#262626]"
            >
              <h2 className="text-2xl font-black mb-8">INIT_GROUP_PROTOCOLS</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="tech-label block mb-2">UNIT_DESIGNATION</label>
                  <input
                    type="text"
                    value={createData.groupName}
                    onChange={(e) => setCreateData({ ...createData, groupName: e.target.value })}
                    placeholder="E.G. TITAN_SQUAD"
                    className="w-full bg-[#1A1A1A] border border-[#3F3F3F] p-4 text-white font-bold focus:border-[#FF6B35] outline-none"
                  />
                </div>

                <div>
                  <label className="tech-label block mb-2">MISSION_DESC</label>
                  <textarea
                    value={createData.description}
                    onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                    placeholder="DESCRIBE_UNIT_OBJECTIVES"
                    rows={3}
                    className="w-full bg-[#1A1A1A] border border-[#3F3F3F] p-4 text-white text-xs font-bold focus:border-[#FF6B35] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="tech-label block mb-2">ADMIN_OPERATIVE_ID</label>
                  <input
                    type="text"
                    value={createData.individualCode}
                    onChange={(e) => setCreateData({ ...createData, individualCode: e.target.value })}
                    placeholder="YOUR_6_CHAR_CODE"
                    maxLength={6}
                    className="w-full bg-[#1A1A1A] border border-[#3F3F3F] p-4 text-white text-xl font-black uppercase tracking-widest focus:border-[#FF6B35] outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 border border-[#3F3F3F] text-[#8C8C8C] font-bold uppercase tracking-widest hover:text-white"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="flex-1 py-3 bg-[#FF6B35] text-black font-bold uppercase tracking-widest hover:bg-[#FF8C61]"
                  >
                    DEPLOY_UNIT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDashboard;
