import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, LayoutGrid, Plus, User, ShieldAlert, Users, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

const BottomNav = () => {
  const location = useLocation();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.get('show_leaderboard');
      setShowLeaderboard(res.data.value);
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const navItems = [
    { path: '/', icon: LayoutGrid, label: 'HOME' },
    { path: '/chat', icon: MessageCircle, label: 'CHAT' },
    { path: '/my-performance', icon: User, label: 'ME' },
    { path: '/group-performance', icon: Users, label: 'GROUP' },
    { path: '/submit', icon: Plus, label: 'SUBMIT', highlight: true },
    ...(showLeaderboard ? [{ path: '/leaderboard', icon: Trophy, label: 'RANKS' }] : []),
    { path: '/admin', icon: ShieldAlert, label: 'ADMIN' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-lg border-t border-[#3F3F3F] lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <div className="flex flex-col items-center justify-center relative py-1">
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-[1px] w-8 h-[2px] bg-[#FF6B35]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`p-1.5 rounded-xl transition-all ${item.highlight
                  ? 'bg-[#FF6B35] text-black -translate-y-4 shadow-[0_4px_15px_rgba(255,107,53,0.4)] border-4 border-[#050505]'
                  : active
                    ? 'text-[#FF6B35]'
                    : 'text-[#8C8C8C]'
                  }`}>
                  <Icon size={item.highlight ? 24 : 20} strokeWidth={active ? 2.5 : 2} />
                </div>
                {!item.highlight && (
                  <span className={`text-[9px] font-black tracking-widest mt-0.5 ${active ? 'text-[#FF6B35]' : 'text-[#8C8C8C]'
                    }`}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      {/* Safe Area Padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[#1A1A1A]" />
    </nav>
  );
};

export default BottomNav;
