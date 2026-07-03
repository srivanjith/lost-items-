import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, LogOut, LayoutDashboard, Search as SearchIcon, 
  PlusCircle, ShieldAlert, Sparkles, User, Shield
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/redirect?to=/&msg=Ending secure authentication session');
  };

  const isActive = (path) => location.pathname === path;

  const getNavLinkClass = (path) => `
    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative
    ${isActive(path) 
      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-md shadow-amber-500/5 scale-[1.02] border border-amber-500/30 font-bold' 
      : 'text-slate-350 hover:bg-slate-900/60 hover:text-slate-100 border border-transparent'}
  `;

  // Desktop core navigation links (excl. dropdowns to prevent clutter)
  const navigation = [
    { name: 'Home', path: '/', icon: <Shield className="w-4 h-4" /> }
  ];

  if (user) {
    navigation.push(
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: 'Search Catalog', path: '/search', icon: <SearchIcon className="w-4 h-4" /> },
      { name: 'Matches', path: '/matches', icon: <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> }
    );
  }

  // Mobile flat navigation links
  const mobileNavigation = [
    { name: 'Home', path: '/', icon: <Shield className="w-4 h-4" /> }
  ];

  if (user) {
    mobileNavigation.push(
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: 'Search Catalog', path: '/search', icon: <SearchIcon className="w-4 h-4" /> },
      { name: 'Report Lost Item', path: '/report-lost', icon: <PlusCircle className="w-4 h-4 text-rose-500" /> },
      { name: 'Report Found Item', path: '/report-found', icon: <PlusCircle className="w-4 h-4 text-emerald-500" /> },
      { name: 'Matches', path: '/matches', icon: <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> },
      { name: 'My Profile', path: '/profile', icon: <User className="w-4 h-4" /> }
    );
  }

  if (isAdmin) {
    mobileNavigation.push({
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
      <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-amber-500/3 blur-[150px] -z-20 animate-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-blue-900/5 blur-[150px] -z-20 animate-blob-2 pointer-events-none"></div>

      {/* Header / Navbar */}
      <nav className="glass-card sticky top-0 z-40 border-b border-amber-500/10 backdrop-blur-md bg-opacity-70 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Branding */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 text-amber-400 hover:text-amber-300 transition-colors group">
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-2.5 rounded-xl border border-amber-500/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Shield className="w-5 h-5 text-amber-450 group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className="font-extrabold text-lg tracking-widest text-slate-100 hidden sm:block">
                  BEACON<span className="shimmer-text font-black">RECOVERY</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => (
                <Link key={item.name} to={item.path} className={getNavLinkClass(item.path)}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Desktop Report Item Dropdown */}
              {user && (
                <div 
                  className="relative z-50"
                  onMouseEnter={() => setReportDropdownOpen(true)}
                  onMouseLeave={() => setReportDropdownOpen(false)}
                >
                  <button 
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border border-transparent cursor-pointer hover:bg-slate-900/60 hover:text-slate-100 ${
                      isActive('/report-lost') || isActive('/report-found') 
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-405 border-amber-500/30 font-bold' 
                        : 'text-slate-350'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Report Property</span>
                  </button>
                  
                  {reportDropdownOpen && (
                    <div className="absolute left-0 mt-0 w-48 rounded-2xl glass-card border border-white/[0.08] shadow-xl overflow-hidden py-1.5 z-55 animate-fade-in">
                      <Link 
                        to="/report-lost" 
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-900/40 hover:text-rose-500 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Report Lost Item</span>
                      </Link>
                      <Link 
                        to="/report-found" 
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-900/40 hover:text-emerald-500 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Report Found Item</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop User Dropdown Control */}
            {user ? (
              <div 
                className="hidden lg:block relative z-50"
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2.5 text-xs text-slate-350 hover:text-slate-200 bg-white/[0.02] hover:bg-white/[0.06] py-2 px-3.5 rounded-xl border border-white/[0.04] shadow-md transition-all cursor-pointer"
                >
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-455 border border-amber-500/20">
                    {user.role}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-0 w-48 rounded-2xl glass-card border border-white/[0.08] shadow-xl overflow-hidden py-1.5 z-55 animate-fade-in">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-900/40 hover:text-amber-400 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-900/40 hover:text-rose-500 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    
                    <hr className="border-slate-700/40 my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-550 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-slate-950 font-bold py-2.5 px-5 rounded-xl text-xs shadow-lg shadow-amber-500/5 transition-all duration-300 hover:scale-[1.02] border border-amber-400/20"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}

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
          <div className="lg:hidden bg-slate-950/95 border-b border-slate-900 px-3 pt-2 pb-4 space-y-1.5 backdrop-blur-lg">
            {mobileNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-650/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-350 hover:bg-slate-900/60'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <hr className="border-slate-900 my-2" />
            
            {user ? (
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-slate-300">{user.name}</span>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-lg bg-amber-550/10 text-amber-405">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 text-rose-400 font-bold text-xs hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="px-4 py-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
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
      <footer className="glass-card border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Beacon State University. Campus Property Recovery Services. All rights reserved.</p>
          <div className="flex gap-4 font-semibold text-slate-400">
            <span className="hover:text-amber-405 transition-colors cursor-pointer">Security Office</span>
            <span className="hover:text-amber-405 transition-colors cursor-pointer">Campus Directory</span>
            <span className="hover:text-amber-405 transition-colors cursor-pointer">Map & Directions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
