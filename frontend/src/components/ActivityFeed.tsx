import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Footprints, Bike, Timer, Dumbbell, Move, Zap, Activity as ActivityIcon } from 'lucide-react';
import { Activity } from '../services/api';

const activityConfig: Record<string, { icon: any, label: string }> = {
  Walking: { icon: Footprints, label: 'LOC_WALK' },
  Running: { icon: ActivityIcon, label: 'LOC_RUN' },
  Cycling: { icon: Bike, label: 'LOC_CYCLE' },
  Yoga: { icon: Timer, label: 'LOC_YOGA' },
  Gym: { icon: Dumbbell, label: 'LOC_GYM' },
  Other: { icon: Move, label: 'LOC_OTHER' },
};

interface ActivityItemProps {
  activity: Activity;
  index: number;
}

const ActivityItem = ({ activity, index }: ActivityItemProps) => {
  const config = activityConfig[activity.activityType] || activityConfig.Other;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group p-4 bg-[#1F1F1F] border border-[#3F3F3F] hover:border-[#FF6B35]/50 transition-all flex items-center gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-full w-[2px] bg-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-3 bg-[#262626] border border-[#3F3F3F] text-[#FF6B35] group-hover:bg-[#FF6B35] group-hover:text-black transition-colors">
        <Icon size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-sm font-bold text-white tracking-tight truncate uppercase">
            {activity.participantName}
          </h4>
          <span className="text-[10px] font-bold text-[#4A4A4A] bg-[#262626] px-1.5 py-0.5 border border-[#3F3F3F]">
            T_{(() => {
              try {
                return format(new Date(activity.createdAt), 'HH:mm');
              } catch (e) {
                return '00:00';
              }
            })()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-black text-[#FF6B35] tracking-widest uppercase">
            {config.label}
          </span>
          <div className="h-[2px] w-[2px] bg-[#4A4A4A]" />
          <span className="text-[10px] text-[#8C8C8C] font-bold tracking-wider">
            {activity.distance > 0 && `DST_${activity.distance}KM `}
            {activity.distance > 0 && activity.duration > 0 && '| '}
            {activity.duration > 0 && `DUR_${activity.duration}MIN`}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed = ({ activities = [] }: ActivityFeedProps) => {
  return (
    <div className="industrial-panel p-6 h-full flex flex-col border-l-4 border-l-[#FF6B35]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Zap className="text-[#FF6B35]" size={20} fill="currentColor" />
          <h3 className="text-xl tracking-tighter">LIVE_ACTIVITY_FEED</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 bg-[#2ECC71] rounded-full animate-pulse" />
          <span className="text-[10px] text-[#2ECC71] font-bold tracking-widest">SENSORS_ONLINE</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
        <AnimatePresence mode="popLayout">
          {!activities || activities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#3F3F3F] diagonal-bg"
            >
              <ActivityIcon className="text-[#3F3F3F] mb-4" size={48} />
              <p className="text-sm font-bold text-[#8C8C8C] tracking-widest uppercase">WAITING_FOR_DATA_PACKETS</p>
            </motion.div>
          ) : (
            activities.map((activity, index) => (
              <ActivityItem key={activity._id} activity={activity} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-4 border-t border-[#3F3F3F]">
        <div className="flex justify-between items-center text-[9px] font-bold text-[#4A4A4A] tracking-[0.3em]">
          <span>PKT_RCV_OK</span>
          <span>FOC_FEED_PROT_V1.0</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
