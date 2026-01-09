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
  Zap
} from 'lucide-react';
import { participantsApi, settingsApi } from '../services/api';

const AdminDashboard = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    email: '',
    mobile: '',
    activityType: 'Walking'
  });
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResults] = useState<any>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchSettings();
    }
  }, [isAuthorized]);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.get('show_leaderboard');
      setShowLeaderboard(res.data.value);
    } catch (err) {
      console.error('Failed to fetch settings');
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
    if (password === '9993') {
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
      setManualData({ name: '', email: '', mobile: '', activityType: 'Walking' });
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
    <div className="max-w-6xl mx-auto py-12 space-y-12">
      <header className="border-b-2 border-[#FF6B35] pb-6 flex justify-between items-end">
        <div>
          <div className="tech-label text-[#FF6B35]">ADMIN_PROTOCOL: PARTICIPANT_MANAGEMENT</div>
          <h1 className="text-5xl font-black tracking-tighter text-white">CENTRAL_COMMAND</h1>
        </div>
        <ShieldAlert className="text-[#FF6B35] mb-2" size={40} />
      </header>

      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-8 py-3 font-bold tracking-widest text-xs transition-all ${activeTab === 'manual' ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] text-gray-500 border border-[#2D2D2D]'}`}
        >
          MANUAL_ENTRY
        </button>
        <button 
          onClick={() => setActiveTab('bulk')}
          className={`px-8 py-3 font-bold tracking-widest text-xs transition-all ${activeTab === 'bulk' ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] text-gray-500 border border-[#2D2D2D]'}`}
        >
          BULK_IMPORT_CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
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
                    <label className="tech-label text-white">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none"
                      value={manualData.name}
                      onChange={e => setManualData({...manualData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none"
                      value={manualData.email}
                      onChange={e => setManualData({...manualData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Mobile Number</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none"
                      value={manualData.mobile}
                      onChange={e => setManualData({...manualData, mobile: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="tech-label text-white">Primary Activity</label>
                    <select 
                      className="w-full bg-[#050505] border-2 border-[#2D2D2D] p-4 text-white focus:border-[#FF6B35] outline-none appearance-none"
                      value={manualData.activityType}
                      onChange={e => setManualData({...manualData, activityType: e.target.value})}
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
            ) : (
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
                    <p className="text-[10px] text-gray-500 mt-2">REQUIRED_HEADERS: name, email, mobile, activityType</p>
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
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="industrial-panel p-6 border-l-4 border-l-[#FF6B35]">
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#FF6B35]" size={20} />
              <h3 className="text-xl">DB_OPERATIONS</h3>
            </div>
            <div className="space-y-4">
              {/* Leaderboard Toggle */}
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
              </div>
              <div className="p-4 bg-[#1F1F1F] border border-[#3F3F3F] flex items-center gap-4">
                <CheckCircle2 size={24} className="text-[#2ECC71]" />
                <div>
                  <p className="text-xs font-bold text-white uppercase">Relay Status</p>
                  <p className="text-[10px] text-gray-500">Comms channels synchronized</p>
                </div>
              </div>
            </div>
          </div>

          <div className="industrial-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-[#FF6B35]" size={20} />
              <h3 className="text-xl font-bold uppercase tracking-tight italic">Protocol Warning</h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed font-bold tracking-wider">
              AUTHORIZED ACCESS ONLY. ALL TRANSACTIONS ARE LOGGED AT THE TRUST CENTRAL SERVER. 
              ENSURE CSV HEADERS MATCH THE PROTOCOL SPECIFICATIONS EXACTLY TO AVOID DATA CORRUPTION.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;