import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from '../services/api';

// Branding Colors
const BRAND_ORANGE = '#FF6B35';
const SOFT_ORANGE = '#FF8C5A';
const DARK_ORANGE = '#CC4E14';
const ACCENT_WHITE = '#E0E0E0';
const MUTED_GRAY = '#4A4A4A';

const PIE_COLORS = [BRAND_ORANGE, '#4ADE80', '#3B82F6', '#A855F7', '#EC4899', '#F59E0B'];

interface ActivityChartsProps {
  activities: Activity[];
}

const ActivityCharts = ({ activities = [] }: ActivityChartsProps) => {
  // Aggregate data for Activity Type breakdown
  const distributionData = (activities || []).reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.activityType);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: curr.activityType, value: 1 });
    }
    return acc;
  }, []);

  // Weekly activity summary (last 7 days logic would go here, using demo for now)
  const weeklySummary = [
    { day: 'Mon', activities: 12 },
    { day: 'Tue', activities: 18 },
    { day: 'Wed', activities: 15 },
    { day: 'Thu', activities: 25 },
    { day: 'Fri', activities: 22 },
    { day: 'Sat', activities: 35 },
    { day: 'Sun', activities: 28 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Daily Participation Chart (Very simple to understand) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="industrial-panel p-8 border-l-4 border-l-[#FF6B35]"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Weekly Activity Overview</h3>
          <p className="text-sm text-gray-500">Number of activities submitted by everyone this week</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 107, 53, 0.1)' }}
                contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #2D2D2D', borderRadius: '8px' }}
                itemStyle={{ color: BRAND_ORANGE, fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="activities" 
                fill={BRAND_ORANGE} 
                radius={[4, 4, 0, 0]} 
                name="Activities"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 2. Popular Activities (Pie chart with clear labels) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="industrial-panel p-8 border-l-4 border-l-[#4ADE80]"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Most Popular Activities</h3>
          <p className="text-sm text-gray-500">Which sports are people choosing the most?</p>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData.length > 0 ? distributionData : [{ name: 'No Data Yet', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
              >
                {distributionData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
                {distributionData.length === 0 && <Cell fill="#1A1A1A" />}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #2D2D2D', borderRadius: '8px' }}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                iconType="circle"
                formatter={(value) => <span className="text-xs font-bold text-gray-400 ml-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityCharts;
