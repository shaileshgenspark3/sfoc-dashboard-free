import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Activity as ActivityIcon,
  Hash,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Flame,
  Footprints,
  Bike,
  Timer,
  Dumbbell,
  ChevronDown,
} from 'lucide-react';
import Confetti, { smallBurst } from '../components/Confetti';
import { activitiesApi, ActivitySubmission, Badge } from '../services/api';
import { AchievementPopup } from '../components/AchievementPopup';

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
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [participant, setParticipant] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.activityType) {
      toast.error('FIELD_REQUIRED: OPERATIVE_CODE & ACTIVITY_TYPE');
      return;
    }

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

      setStreak(response.data.streak || 1);
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        setNewBadges(response.data.newBadges);
      }
      if (response.data.participant) {
        setParticipant(response.data.participant);
      }

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
        setParticipant(null);
      }, 6000);
    } catch (error: any) {
      toast.error(error.message || 'TRANSMISSION_INTERRUPTED');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AchievementPopup badges={newBadges} participant={participant} onClose={() => setNewBadges([])} />
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 py-4 md:py-8 px-4 sm:px-0">
        <Confetti trigger={success} />

        <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#FF6B35] pb-4 md:pb-6 gap-4">
          <div>
            <div className="tech-label text-[#FF6B35]">UPLINK_MODULE: FIT-O-CHARITY_V2</div>
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-white">SUBMIT_ACTIVITY</h2>
          </div>
          <div className="text-left md:text-right">
            <div className="tech-label">SECURITY_STATUS</div>
            <div className="text-[#2ECC71] text-[10px] font-bold tracking-widest flex items-center md:justify-end gap-2">
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
              className="industrial-panel p-8 md:p-16 text-center bg-[#FF6B35]/10 border-[#FF6B35] relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B35] animate-tech-reveal" />
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-4 md:p-6 bg-[#FF6B35] text-black shadow-[0_0_20px_rgba(255,107,53,0.3)] md:shadow-[0_0_30px_rgba(255,107,53,0.5)]"
                >
                  <Zap size={48} fill="currentColor" className="md:w-16 md:h-16" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">MISSION_ACCOMPLISHED</h2>
                  <p className="text-[10px] md:text-xs text-[#8C8C8C] font-bold uppercase tracking-widest px-4">Performance metrics synchronized with FIT-O-CHARITY central command.</p>
                </div>

                {streak > 1 && (
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 md:gap-6 px-6 md:px-10 py-3 md:py-4 bg-white text-black font-black text-xl md:text-2xl uppercase tracking-tighter shadow-[5px_5px_0px_0px_#FF6B35] md:shadow-[10px_10px_0px_0px_#FF6B35]"
                  >
                    <Flame size={24} fill="currentColor" className="text-[#FF6B35] md:w-8 md:h-8" />
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
            >
              {/* Primary Inputs */}
              <div className="lg:col-span-7 space-y-6 md:space-y-8">
                <div className="industrial-panel p-6 md:p-8 space-y-4 md:space-y-6 border-l-4 border-l-[#FF6B35]">
                  <div className="flex items-center gap-3">
                    <Hash size={20} className="text-[#FF6B35]" />
                    <label className="tech-label text-white">OPERATIVE_UID</label>
                  </div>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="6_CHAR_CODE"
                    maxLength={6}
                    className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-4 md:p-6 text-white text-3xl md:text-4xl font-black uppercase tracking-[0.4em] focus:border-[#FF6B35] outline-none transition-all placeholder:text-[#2D2D2D] placeholder:tracking-normal placeholder:text-lg"
                  />
                </div>

                <div className="industrial-panel p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3">
                    <ActivityIcon size={20} className="text-[#FF6B35]" />
                    <label className="tech-label text-white">PERFORMANCE_MODALITY</label>
                  </div>
                  <div className="relative">
                    <select
                      name="activityType"
                      value={formData.activityType}
                      onChange={handleChange}
                      className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-4 md:p-6 text-white text-base md:text-xl font-bold uppercase tracking-widest focus:border-[#FF6B35] outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>SELECT_ACTIVITY</option>
                      {activityTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-[#FF6B35] pointer-events-none" size={24} />
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {activityTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.id}
                          className={`p-2 md:p-3 border text-center transition-colors cursor-pointer ${formData.activityType === type.id ? 'bg-[#FF6B35] text-black border-[#FF6B35]' : 'bg-[#1A1A1A] text-[#444] border-[#2D2D2D]'}`}
                          onClick={() => setFormData(prev => ({ ...prev, activityType: type.id }))}
                        >
                          <Icon size={18} className="mx-auto mb-1 md:w-5 md:h-5" />
                          <div className="text-[7px] md:text-[8px] font-black">{type.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Secondary/Optional Inputs */}
              <div className="lg:col-span-5 space-y-6 md:space-y-8">
                <div className="industrial-panel p-6 md:p-8 space-y-4 md:space-y-6 bg-[#1A1A1A]/50">

                  {(formData.activityType === 'Walking' || formData.activityType === 'Running' || formData.activityType === 'Cycling') && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#FF6B35]" />
                        <label className="tech-label text-white">DIST_KM</label>
                      </div>
                      <input
                        type="number"
                        name="distance"
                        value={formData.distance}
                        onChange={handleChange}
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-3 text-white text-xl font-black focus:border-[#FF6B35] outline-none"
                      />
                    </div>
                  )}

                  {(formData.activityType === 'Yoga' || formData.activityType === 'Gym') && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-[#FF6B35]" />
                        <label className="tech-label text-white">MINS</label>
                      </div>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="w-full bg-[#0D0D0D] border-2 border-[#2D2D2D] p-3 text-white text-xl font-black focus:border-[#FF6B35] outline-none"
                      />
                    </div>
                  )}

                  {!formData.activityType && (
                    <div className="p-4 border border-[#2D2D2D] text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                      Select Activity Type to Enter Metrics
                    </div>
                  )}

                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-safety w-full py-5 md:py-6 flex items-center justify-center gap-4 text-xl md:text-2xl group shadow-[4px_4px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000]"
                >
                  <Zap size={24} fill="currentColor" className="group-hover:animate-pulse md:w-7 md:h-7" />
                  {submitting ? 'SYNCING...' : 'INITIALIZE_LOG'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <footer className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 pt-4 md:pt-8">
          {[
            { label: "PROTOCOL", val: "UPLINK_v2.0" },
            { label: "CLOCK", val: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) },
            { label: "SEC", val: "AES_256" },
            { label: "LAT", val: "18ms" }
          ].map((item, i) => (
            <div key={i} className="p-3 md:p-4 border border-[#2D2D2D] bg-[#1A1A1A]/30">
              <div className="tech-label opacity-50 text-[8px] md:text-[10px]">{item.label}</div>
              <div className="text-[8px] md:text-[10px] font-bold text-white tracking-widest truncate">{item.val}</div>
            </div>
          ))}
        </footer>
      </div>
    </>
  );
};

export default SubmitActivity;