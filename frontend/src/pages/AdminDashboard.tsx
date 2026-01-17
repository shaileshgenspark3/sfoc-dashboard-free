import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users,
  Upload,
  UserPlus,
  FileText,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Database,
  Lock,
  Zap,
  Activity as ActivityIcon,
  Trash2,
  Edit2,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { participantsApi, settingsApi, adminApi, groupsApi, Activity } from '../services/api';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk' | 'activities' | 'groups'>('manual');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const [manualData, setManualData] = useState({
    name: '',
    email: '',
    mobile: '',
    code: '',
    activityType: 'Walking'
  });
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResults] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchSettings();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized && activeTab === 'activities') {
      fetchActivities();
    }
    if (isAuthorized && activeTab === 'groups') {
      fetchGroups();
    }
  }, [isAuthorized, activeTab]);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.get('show_leaderboard');
      setShowLeaderboard(res.data.value);
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await adminApi.getActivities();
      console.log('Admin Activities:', res.data); // Debug
      setActivities(res.data);
    } catch (err) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoadingActivities(false);
    }
  };

  const toggleLeaderboard = async () => {
    try {
      const newValue = !showLeaderboard;
      await settingsApi.update('show_leaderboard', newValue);
      setShowLeaderboard(newValue);
      toast.success(`LEADERBOARD_${newValue ? 'ACTIVATED' : 'DEACTIVATED'}`);
    } catch (err) {
      toast.error('FAILED_TO_UPDATE_SETTING');
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '9933') {
      setIsAuthorized(true);
      toast.success('ACCESS_GRANTED: ADMIN_PRIVILEGES_ACTIVE');
    } else {
      toast.error('ACCESS_DENIED: INVALID_CREDENTIALS');
      setPassword('');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await participantsApi.register(manualData);
      toast.success(`User Registered! Code: ${res.data.participant.individualCode}`);
      setManualData({ name: '', email: '', mobile: '', code: '', activityType: 'Walking' });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleBulkImport = async () => {
    if (!file) return toast.error('Please select a CSV file');
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await participantsApi.bulkImport(formData);
      setImportResults(res.data);
      toast.success('Import Cycle Completed');
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('Are you sure? This will remove points from the user.')) return;
    try {
      await adminApi.deleteActivity(id);
      setActivities(activities.filter(a => a._id !== id));
      toast.success('ACTIVITY_DELETED');
    } catch (err) {
      toast.error('DELETE_FAILED');
    }
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    try {
      const res = await adminApi.updateActivity(editingActivity._id, {
        distance: Number(editingActivity.distance),
        duration: Number(editingActivity.duration),
        activityType: editingActivity.activityType
      });
      setActivities(activities.map(a => a._id === editingActivity._id ? res.data.data : a));
      setEditingActivity(null);
      toast.success('ACTIVITY_UPDATED');
    } catch (err) {
      toast.error('UPDATE_FAILED');
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await groupsApi.getAll();
      setGroups(res.data);
    } catch (err) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    try {
      const res = await groupsApi.update(editingGroup.groupCode, {
        groupName: editingGroup.groupName,
        description: editingGroup.description
      });
      setGroups(groups.map(g => g.groupCode === editingGroup.groupCode ? res.data : g));
      setEditingGroup(null);
      toast.success('GROUP_UPDATED');
    } catch (err) {
      toast.error('UPDATE_FAILED');
    }
  };

  const handleSync = async () => {
    if (!window.confirm('Force sync all Strava data? This may take a while.')) return;
    setSyncLoading(true);
    try {
      const res = await adminApi.syncStrava();
      toast.success(`SYNC_COMPLETE: ${res.data.count} ACTIVITIES`);
    } catch (err) {
      toast.error('SYNC_FAILED');
    } finally {
      setSyncLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-12 max-w-md w-full border-t-4 border-t-[#FF6B35] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock size={120} />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="tech-label text-[#FF6B35]">SECURITY_GATE: LEVEL_01</div>
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">IDENTITY_VERIFICATION</h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="tech-label text-white">ACCESS_CODE</label>
                <input
                  type="password"
                  autoFocus
                  className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-6 text-white text-center text-4xl font-black tracking-[0.5em] focus:border-[#FF6B35] outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="****"
                />
              </div>

              <button type="submit" className="btn-safety w-full py-5 flex items-center justify-center gap-4 text-xl">
                <Zap size={24} fill="currentColor" />
                VERIFY_AUTHORITY
              </button>
            </form>

            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold justify-center tracking-widest uppercase">
              <AlertCircle size={12} />
              Secured by sukrut_parivar_shield_v2
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 space-y-12">
      <header className="border-b-2 border-[#FF6B35] pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="tech-label text-[#FF6B35]">ADMIN_PROTOCOL: CENTRAL_COMMAND</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">SYSTEM_ADMIN</h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 font-bold tracking-widest text-xs transition-all bg-[#1A1A1A] text-[#2ECC71] border border-[#2ECC71]/50 hover:bg-[#2ECC71] hover:text-black flex items-center gap-2"
          >
            EXPORT_DATA
          </a>
          <ShieldAlert className="text-[#FF6B35]" size={40} />
        </div>
      </header>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 font-bold tracking-widest text-xs transition-all ${activeTab === 'manual' ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] text-gray-500 border border-[#2D2D2D]'}`}
        >
          MANUAL_ENTRY
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-6 py-3 font-bold tracking-widest text-xs transition-all ${activeTab === 'bulk' ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] text-gray-500 border border-[#2D2D2D]'}`}
        >
          BULK_IMPORT
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-6 py-3 font-bold tracking-widest text-xs transition-all ${activeTab === 'activities' ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] text-gray-500 border border-[#2D2D2D]'}`}
        >
          ACTIVITY_LOGS
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-3 font-bold tracking-widest text-xs transition-all ${activeTab === 'groups' ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] text-gray-500 border border-[#2D2D2D]'}`}
        >
          MANAGE_SQUADS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'manual' && (
              <motion.form
                key="manual"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleManualSubmit}
                className="industrial-panel p-8 space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="text-[#FF6B35]" size={20} />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Add New Operative</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="tech-label text-white">Participant Code (Required)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1999"
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none uppercase"
                      value={manualData.code}
                      onChange={e => setManualData({ ...manualData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none"
                      value={manualData.name}
                      onChange={e => setManualData({ ...manualData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none"
                      value={manualData.email}
                      onChange={e => setManualData({ ...manualData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Mobile Number</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none"
                      value={manualData.mobile}
                      onChange={e => setManualData({ ...manualData, mobile: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Primary Activity</label>
                    <select
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none appearance-none"
                      value={manualData.activityType}
                      onChange={e => setManualData({ ...manualData, activityType: e.target.value })}
                    >
                      {['Walking', 'Running', 'Cycling', 'Yoga', 'Gym', 'Other'].map(type => (
                        <option key={type} value={type}>{type.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-safety w-full py-4 mt-4 flex items-center justify-center gap-3">
                  COMMIT_OPERATIVE_TO_REGISTRY
                  <ArrowRight size={18} />
                </button>
              </motion.form>
            )}

            {activeTab === 'bulk' && (
              <motion.div
                key="bulk"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="industrial-panel p-8 space-y-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="text-[#FF6B35]" size={20} />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Bulk Data Uplink</h3>
                </div>

                <div className="border-2 border-dashed border-[#2D2D2D] p-12 text-center space-y-4 hover:border-[#FF6B35]/50 transition-colors">
                  <input
                    type="file"
                    id="csv-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer group">
                    <FileText className="mx-auto mb-4 text-[#444] group-hover:text-[#FF6B35] transition-colors" size={64} />
                    <p className="text-lg font-bold text-white uppercase tracking-widest">
                      {file ? file.name : 'Drop CSV File or Click to Browse'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2">REQUIRED_HEADERS: code, name, email, mobile, activityType</p>
                  </label>
                </div>

                <button
                  onClick={handleBulkImport}
                  disabled={importing || !file}
                  className={`btn-safety w-full py-4 flex items-center justify-center gap-3 ${importing || !file ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {importing ? 'UPLOADING_AND_PARSING...' : 'INITIALIZE_BULK_SYNCHRONIZATION'}
                </button>

                {importResult && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#050505] p-4 border border-[#2ECC71]/30">
                      <div className="tech-label text-[#2ECC71]">SUCCESS_COUNT</div>
                      <div className="text-3xl font-black text-white">{importResult.success}</div>
                    </div>
                    <div className="bg-[#050505] p-4 border border-[#FF4B2B]/30">
                      <div className="tech-label text-[#FF4B2B]">FAILURE_COUNT</div>
                      <div className="text-3xl font-black text-white">{importResult.failed}</div>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="col-span-2 bg-[#1A1A1A] p-4 text-[10px] font-mono text-red-400 max-h-32 overflow-y-auto">
                        {importResult.errors.map((err: string, i: number) => (
                          <div key={i}>ERR_LOG_{i}: {err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="industrial-panel p-0 overflow-hidden"
              >
                <div className="p-6 border-b border-[#2D2D2D] bg-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <ActivityIcon className="text-[#FF6B35]" size={20} />
                    <h3 className="text-xl font-bold uppercase tracking-tight">Activity Logs</h3>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {loadingActivities ? (
                    <div className="p-12 text-center text-gray-500">Retrieving logs...</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-[#0D0D0D] sticky top-0 z-10">
                        <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#2D2D2D]">
                          <th className="p-4">Date</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Metrics</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2D2D2D]">
                        {activities.map((activity) => (
                          <tr key={activity._id} className="hover:bg-[#1F1F1F] transition-colors">
                            <td className="p-4 text-xs font-mono text-gray-400">
                              {format(new Date(activity.createdAt), 'dd/MM HH:mm')}
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-bold text-white">{activity.participantName}</div>
                              <div className="text-[10px] text-[#FF6B35] font-mono">{activity.participantCode}</div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-bold bg-[#262626] px-2 py-1 border border-[#3F3F3F]">
                                {activity.activityType}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-bold text-gray-300">
                              {activity.distance > 0 ? `${activity.distance}KM` : `${activity.duration}MIN`}
                              <span className="text-[#FF6B35] ml-2">({activity.points} PTS)</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingActivity(activity)}
                                  className="p-2 hover:text-[#FF6B35] transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(activity._id)}
                                  className="p-2 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'groups' && (
              <motion.div
                key="groups"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="industrial-panel p-0 overflow-hidden"
              >
                <div className="p-6 border-b border-[#2D2D2D] bg-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <Users className="text-[#FF6B35]" size={20} />
                    <h3 className="text-xl font-bold uppercase tracking-tight">MANAGE SQUADS</h3>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto p-6">
                  {loadingGroups ? (
                    <div className="p-12 text-center text-gray-500">Retrieving squads...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groups.map((group) => (
                        <div key={group._id} className="p-4 bg-[#1F1F1F] border border-[#3F3F3F] flex items-center justify-between hover:border-[#FF6B35] transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white tracking-tight">{group.groupName}</h4>
                              <span className="text-[10px] font-mono text-[#FF6B35] bg-[#333] px-1 rounded">{group.groupCode}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{group.members?.length || 0} OPERATIVES</p>
                          </div>
                          <button
                            onClick={() => setEditingGroup(group)}
                            className="p-2 bg-[#2D2D2D] hover:bg-[#FF6B35] hover:text-black transition-colors rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="industrial-panel p-6 border-l-4 border-l-[#FF6B35]">
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#FF6B35]" size={20} />
              <h3 className="text-xl">DB_OPERATIONS</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#1F1F1F] border border-[#3F3F3F] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tighter">Leaderboard Tab</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Global visibility control</p>
                </div>
                <button
                  onClick={toggleLeaderboard}
                  className={`w-12 h-6 rounded-full transition-all relative ${showLeaderboard ? 'bg-[#FF6B35]' : 'bg-[#333]'}`}
                >
                  <motion.div
                    animate={{ x: showLeaderboard ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="p-4 bg-[#1F1F1F] border border-[#3F3F3F]">
                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">System Load</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#333] rounded-full">
                    <div className="h-full bg-[#2ECC71] w-[12%]" />
                  </div>
                  <span className="text-[10px] font-mono">12%</span>
                </div>

                <button
                  onClick={handleSync}
                  disabled={syncLoading}
                  className="w-full p-4 bg-[#1F1F1F] border border-[#3F3F3F] flex items-center justify-between hover:bg-[#2D2D2D] transition-colors group"
                >
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tighter group-hover:text-[#FF6B35] transition-colors">Force Strava Sync</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Manual data fetch trigger</p>
                  </div>
                  <RefreshCw
                    size={16}
                    className={`text-[#8C8C8C] group-hover:text-[#FF6B35] transition-colors ${syncLoading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      <AnimatePresence>
        {editingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="industrial-panel p-8 w-full max-w-lg border-2 border-[#FF6B35]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">EDIT_RECORD</h3>
                <button onClick={() => setEditingActivity(null)} className="text-gray-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateActivity} className="space-y-6">
                <div className="space-y-2">
                  <label className="tech-label text-white">Activity Type</label>
                  <select
                    className="w-full bg-[#050505] border border-[#3F3F3F] p-3 text-white"
                    value={editingActivity.activityType}
                    onChange={e => setEditingActivity({ ...editingActivity, activityType: e.target.value })}
                  >
                    {['Walking', 'Running', 'Cycling', 'Yoga', 'Gym'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="tech-label text-white">Distance (KM)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-[#050505] border border-[#3F3F3F] p-3 text-white"
                      value={editingActivity.distance}
                      onChange={e => setEditingActivity({ ...editingActivity, distance: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Duration (MIN)</label>
                    <input
                      type="number"
                      className="w-full bg-[#050505] border border-[#3F3F3F] p-3 text-white"
                      value={editingActivity.duration}
                      onChange={e => setEditingActivity({ ...editingActivity, duration: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-safety w-full py-4 flex items-center justify-center gap-3">
                  <Save size={20} />
                  SAVE_CHANGES
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {editingGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="industrial-panel p-8 w-full max-w-lg border-2 border-[#FF6B35]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">RENAME_SQUAD</h3>
                <button onClick={() => setEditingGroup(null)} className="text-gray-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="tech-label text-white">Squad Code (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full bg-[#050505] border border-[#3F3F3F] p-3 text-gray-500 cursor-not-allowed"
                    value={editingGroup.groupCode}
                  />
                </div>

                <div className="space-y-2">
                  <label className="tech-label text-white">Squad Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#050505] border border-[#3F3F3F] p-3 text-white focus:border-[#FF6B35] outline-none"
                    value={editingGroup.groupName}
                    onChange={e => setEditingGroup({ ...editingGroup, groupName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="tech-label text-white">Description (Optional)</label>
                  <textarea
                    className="w-full bg-[#050505] border border-[#3F3F3F] p-3 text-white focus:border-[#FF6B35] outline-none h-24"
                    value={editingGroup.description || ''}
                    onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-safety w-full py-4 flex items-center justify-center gap-3">
                  <Save size={20} />
                  UPDATE_SQUAD_DATA
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
