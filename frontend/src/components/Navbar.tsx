import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, LayoutGrid, Plus, Activity, ShieldAlert, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
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
    { path: '/', icon: LayoutGrid, label: 'DASHBOARD' },
    { path: '/submit', icon: Plus, label: 'SUBMIT ACTIVITY', highlight: true },
    { path: '/my-performance', icon: User, label: 'MY PERFORMANCE' },
    { path: '/group-performance', icon: Users, label: 'GROUP PERFORMANCE' },
    ...(showLeaderboard ? [{ path: '/leaderboard', icon: Trophy, label: 'LEADERBOARD' }] : []),
    { path: '/admin', icon: ShieldAlert, label: 'ADMIN' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-md border-b border-[#3F3F3F]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-[#262626] border border-[#3F3F3F] group-hover:border-[#FF6B35] transition-colors">
              <Activity className="text-[#FF6B35]" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-bold tracking-tighter leading-none text-[#FF6B35]">FIT-O-CHARITY</span>
              <span className="text-[8px] sm:text-[10px] text-[#8C8C8C] font-bold tracking-[0.1em]">SUKRUT PARIVAAR CHARITABLE TRUST</span>
            </div>
          </Link>

          {/* Desktop Nav Only */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-[#FF6B35]'
                        : item.highlight 
                        ? 'bg-[#FF6B35] text-black hover:bg-[#FF8C61]' 
                        : 'text-[#8C8C8C] hover:text-[#E5E5E5]'
                    }`}
                    whileHover={{ x: isActive(item.path) ? 0 : 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#FF6B35]/30 to-transparent" />
    </nav>
  );
};

export default Navbar;
