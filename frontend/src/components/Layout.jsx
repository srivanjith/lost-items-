import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, LogOut, LayoutDashboard, Search as SearchIcon, 
  PlusCircle, ShieldAlert, Sparkles, User, MapPin
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getNavLinkClass = (path) => `
    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative
    ${isActive(path) 
      ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white shadow-lg shadow-indigo-500/20 scale-[1.03] border border-indigo-400/20' 
      : 'text-slate-300 hover:bg-slate-800/40 hover:text-white hover:scale-[1.01] border border-transparent'}
  `;

  const navigation = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Search Catalog', path: '/search', icon: <SearchIcon className="w-4 h-4" /> },
    { name: 'Report Lost Item', path: '/report-lost', icon: <PlusCircle className="w-4 h-4 text-rose-400" /> },
    { name: 'Report Found Item', path: '/report-found', icon: <PlusCircle className="w-4 h-4 text-emerald-400" /> },
    { name: 'Matches', path: '/matches', icon: <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    navigation.push({
      name: 'Admin Panel',
      path: '/admin',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />
    });
  }

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden interactive-glow-bg">
      {/* Animated Drifting Background Orbs */}
      <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[150px] -z-20 animate-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-purple-500/5 blur-[150px] -z-20 animate-blob-2 pointer-events-none"></div>

      {/* Header / Navbar */}
      <nav className="glass-card sticky top-0 z-40 border-b border-white/[0.04] backdrop-blur-md bg-opacity-70 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 transition-colors group">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-2.5 rounded-xl border border-indigo-500/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 text-indigo-450 group-hover:rotate-12 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="11" r="3" />
                    <path d="M12 8v6M9 11h6" />
                  </svg>
                </div>
                <span className="font-extrabold text-lg tracking-widest text-slate-100 hidden sm:block">
                  CAMPUS<span className="shimmer-text font-black">RETRIEVE</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5">
              {navigation.map((item) => (
                <Link key={item.name} to={item.path} className={getNavLinkClass(item.path)}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Profile and Logout */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-350 bg-white/[0.02] py-2 px-3.5 rounded-xl border border-white/[0.04] shadow-md">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="font-semibold text-slate-200">{user?.name}</span>
                <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-450 border border-indigo-550/20">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-450 hover:text-rose-450 transition-all py-2 px-3.5 rounded-xl hover:bg-rose-500/10 text-xs font-semibold border border-transparent hover:border-rose-500/20 hover:scale-[1.02] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/95 border-b border-slate-800/80 px-3 pt-2 pb-4 space-y-1.5 backdrop-blur-lg">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-indigo-650 to-purple-650 text-white'
                    : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <hr className="border-slate-900 my-2" />
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-semibold text-slate-300">{user?.name}</span>
                <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 text-rose-450 font-bold text-xs hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-slate-900/60 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusRetrieve - College Lost & Found Portal. All rights reserved.</p>
          <div className="flex gap-4 font-semibold text-slate-400">
            <span className="hover:text-indigo-400 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-indigo-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-indigo-400 transition-colors cursor-pointer">Campus Map</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Layout;
