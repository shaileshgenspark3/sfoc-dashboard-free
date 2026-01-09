import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Activity as ActivityIcon, 
  Hash, 
  MapPin, 
  Clock, 
  Users, 
  Send,
  ShieldCheck,
  Zap,
  Flame,
  Footprints,
  Bike,
  Timer,
  Dumbbell,
  Move,
  ChevronDown
} from 'lucide-react';
import Confetti, { smallBurst } from '../components/Confetti';
import { activitiesApi, ActivitySubmission } from '../services/api';

const activityTypes = [
  { id: 'Walking', icon: Footprints, label: 'WALKING', desc: 'ANY_DURATION' },
  { id: 'Running', icon: ActivityIcon, label: 'RUNNING', desc: 'ANY_DURATION' },
  { id: 'Cycling', icon: Bike, label: 'CYCLING', desc: 'ANY_DURATION' },
  { id: 'Yoga', icon: Timer, label: 'YOGA', desc: 'MIN_30_MINUTES' },
  { id: 'Gym', icon: Dumbbell, label: 'GYM', desc: 'MIN_1_HOUR' },
];

const SubmitActivity = () => {
  const [formData, setFormData] = useState({
    code: '',
    activityType: '',
    distance: '',
    duration: '',
    groupCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [streak, setStreak] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.activityType) {
      toast.error('FIELD_REQUIRED: OPERATIVE_CODE & ACTIVITY_TYPE');
      return;
    }

    // Custom Validation for Yoga and Gym
    if (formData.activityType === 'Yoga' && formData.duration && parseInt(formData.duration) < 30) {
      toast.error('VALIDATION_ERROR: YOGA_MINIMUM_30_MINS');
      return;
    }
    if (formData.activityType === 'Gym' && formData.duration && parseInt(formData.duration) < 60) {
      toast.error('VALIDATION_ERROR: GYM_MINIMUM_60_MINS');
      return;
    }

    setSubmitting(true);

    try {
      const payload: ActivitySubmission = {
        code: formData.code.toUpperCase(),
        activityType: formData.activityType as any,
        distance: formData.distance ? parseFloat(formData.distance) : 0,
        duration: formData.duration ? parseInt(formData.duration) : 0,
        groupCode: formData.groupCode || null,
      };

      const response = await activitiesApi.submit(payload);

      setStreak(response.data.data?.streak || 1);
      setSuccess(true);
      smallBurst();
      
      toast.success('UPLINK_SUCCESSFUL: DATA_COMMITTED');

      setTimeout(() => {
        setFormData({
          code: '',
          activityType: '',
          distance: '',
          duration: '',
          groupCode: '',
        });
        setSuccess(false);
      }, 6000);
    } catch (error: any) {
      toast.error(error.message || 'TRANSMISSION_INTERRUPTED');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <Confetti trigger={success} />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#FF6B35] pb-6 gap-4">
        <div>
          <div className="tech-label text-[#FF6B35]">UPLINK_MODULE: FIT-O-CHARITY_V2</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">SUBMIT_ACTIVITY</h2>
        </div>
        <div className="text-right">
          <div className="tech-label">SECURITY_STATUS</div>
          <div className="text-[#2ECC71] text-xs font-bold tracking-widest flex items-center justify-end gap-2">
            <ShieldCheck size={14} />
            ENCRYPTED_CONNECTION_STABLE
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="industrial-panel p-16 text-center bg-[#FF6B35]/10 border-[#FF6B35] relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B35] animate-tech-reveal" />
            <div className="flex flex-col items-center gap-8">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 bg-[#FF6B35] text-black shadow-[0_0_30px_rgba(255,107,53,0.5)]"
              >
                <Zap size={64} fill="currentColor" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic tracking-tighter text-white">MISSION_ACCOMPLISHED</h2>
                <p className="text-[#8C8C8C] font-bold uppercase tracking-widest">Performance metrics synchronized with FIT-O-CHARITY central command.</p>
              </div>
              
              {streak > 1 && (
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-6 px-10 py-4 bg-white text-black font-black text-2xl uppercase tracking-tighter shadow-[10px_10px_0px_0px_#FF6B35]"
                >
                  <Flame size={32} fill="currentColor" className="text-[#FF6B35]" />
                  STREAK_STABLE: {streak}_DAYS
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Primary Inputs */}
            <div className="lg:col-span-7 space-y-8">
              <div className="industrial-panel p-8 space-y-6 border-l-4 border-l-[#FF6B35]">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-[#FF6B35]" />
                  <label className="tech-label text-white">OPERATIVE_IDENTIFICATION_CODE</label>
                </div>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="ENTER_6_CHARACTER_UID"
                  maxLength={6}
                  className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-6 text-white text-4xl font-black uppercase tracking-[0.4em] focus:border-[#FF6B35] outline-none transition-all placeholder:text-[#2D2D2D] placeholder:tracking-normal placeholder:text-lg"
                />
                <p className="text-[10px] text-[#666666] font-bold">REQUIRED: ENTER THE UNIQUE CODE ASSIGNED DURING REGISTRATION.</p>
              </div>

              <div className="industrial-panel p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <ActivityIcon size={20} className="text-[#FF6B35]" />
                  <label className="tech-label text-white">SELECT_PERFORMANCE_MODALITY</label>
                </div>
                <div className="relative">
                  <select
                    name="activityType"
                    value={formData.activityType}
                    onChange={handleChange}
                    className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-6 text-white text-xl font-bold uppercase tracking-widest focus:border-[#FF6B35] outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>CHOOSE_ACTIVITY_TYPE</option>
                    {activityTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label} ({type.desc})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#FF6B35] pointer-events-none" size={24} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {activityTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <div 
                        key={type.id}
                        className={`p-3 border text-center transition-colors ${formData.activityType === type.id ? 'bg-[#FF6B35] text-black border-[#FF6B35]' : 'bg-[#1A1A1A] text-[#444] border-[#2D2D2D]'}`}
                      >
                        <Icon size={20} className="mx-auto mb-1" />
                        <div className="text-[8px] font-black">{type.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Secondary/Optional Inputs */}
            <div className="lg:col-span-5 space-y-8">
              <div className="industrial-panel p-8 space-y-6 bg-[#1A1A1A]/50">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-[#FF6B35]" />
                  <label className="tech-label text-white">METRIC: DISTANCE_KM</label>
                </div>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.1"
                  min="0"
                  className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-4 text-white text-2xl font-black focus:border-[#FF6B35] outline-none"
                />

                <div className="flex items-center gap-3 pt-4">
                  <Clock size={18} className="text-[#FF6B35]" />
                  <label className="tech-label text-white">METRIC: DURATION_MIN</label>
                </div>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-4 text-white text-2xl font-black focus:border-[#FF6B35] outline-none"
                />
              </div>

              <div className="industrial-panel p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-[#FF6B35]" />
                  <label className="tech-label text-white">STRATEGIC_UNIT_CODE (OPTIONAL)</label>
                </div>
                <input
                  type="text"
                  name="groupCode"
                  value={formData.groupCode}
                  onChange={handleChange}
                  placeholder="GROUP_ID"
                  maxLength={6}
                  className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-4 text-white text-xl font-black uppercase tracking-widest focus:border-[#FF6B35] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-safety w-full py-6 flex items-center justify-center gap-4 text-2xl group shadow-[8px_8px_0px_0px_#000]"
              >
                <Zap size={28} fill="currentColor" className="group-hover:animate-pulse" />
                {submitting ? 'SYNC_IN_PROGRESS...' : 'INITIALIZE_UPLINK'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Protocol Footer */}
      <footer className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8">
        {[
          { label: "PROTOCOL", val: "FOC_UPLINK_v2.0" },
          { label: "TIMESTAMP", val: new Date().toISOString().split('T')[1].split('.')[0] },
          { label: "ENCRYPTION", val: "AES_256_GCM" },
          { label: "LATENCY", val: "24ms" }
        ].map((item, i) => (
          <div key={i} className="p-4 border border-[#2D2D2D] bg-[#1A1A1A]/30">
            <div className="tech-label opacity-50">{item.label}</div>
            <div className="text-[10px] font-bold text-white tracking-widest">{item.val}</div>
          </div>
        ))}
      </footer>
    </div>
  );
};

export default SubmitActivity;