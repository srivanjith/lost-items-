import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, UPLOAD_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  PlusCircle, Sparkles, MapPin, Calendar, Clock, 
  HelpCircle, Eye, ChevronRight, AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, totalMatches: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getStats();
        if (data.success) {
          setStats(data.stats);
          setRecentReports(data.recentReports);
        } else {
          showToast('Failed to load dashboard metrics.', 'error');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast('Error connecting to the server.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-900/60 rounded-3xl border border-slate-800/60"></div>
          ))}
        </div>
        {/* Main Layout Skeleton */}
        <div className="h-96 bg-slate-900/60 rounded-3xl border border-slate-800/60"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="glass-card border border-slate-800/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        {/* Glowing Background Rings */}
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute left-1/3 bottom-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl -z-10"></div>
        
        <div className="space-y-2.5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            Campus Retrieve Portal <Sparkles className="w-6 h-6 text-indigo-400 animate-float" />
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
            Lost something on campus? Or found an item? Report it right away to help synchronize campus retrievals, search existing logs, or browse similarity matches.
          </p>
        </div>
      </div>

      {/* Grid of Statistics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lost Card */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800/35">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-550/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Lost Items</p>
              <h3 className="text-4xl font-extrabold text-slate-100 mt-2">{stats.totalLost}</h3>
            </div>
            <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
              <HelpCircle className="w-6 h-6 text-rose-400" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Active lost reports</span>
            <Link to="/search?type=lost" className="text-rose-400 hover:text-rose-350 font-bold flex items-center gap-0.5 group">
              <span>View catalog</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Found Card */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800/35">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-550/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Found Items</p>
              <h3 className="text-4xl font-extrabold text-slate-100 mt-2">{stats.totalFound}</h3>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <PlusCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Awaiting claims</span>
            <Link to="/search?type=found" className="text-emerald-400 hover:text-emerald-350 font-bold flex items-center gap-0.5 group">
              <span>View catalog</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Matches Card */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800/35">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-550/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Smart Matches</p>
              <h3 className="text-4xl font-extrabold text-slate-100 mt-2">{stats.totalMatches}</h3>
            </div>
            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Similarity score matches</span>
            <Link to="/matches" className="text-amber-400 hover:text-amber-350 font-bold flex items-center gap-0.5 group">
              <span>Inspect matches</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Reports & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity list (2/3 width) */}
        <div className="lg:col-span-2 glass-card border border-slate-800/35 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Recent Campus Reports</span>
            </h2>
            <Link to="/search" className="text-xs text-indigo-400 hover:text-indigo-350 font-semibold hover:underline">
              View all reports
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-slate-850 border-dashed">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No recent reports found</p>
              <p className="text-slate-500 text-xs mt-1">Be the first to report something lost or found!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div 
                  key={`${report.report_type}-${report.id}`} 
                  className="bg-slate-950/25 hover:bg-slate-950/50 border border-slate-900/60 hover:border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Item Type Badge Icon */}
                    <div className={`p-3 rounded-xl border ${
                      report.report_type === 'lost' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-450' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                    }`}>
                      <HelpCircle className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-200 text-sm sm:text-base">{report.item_name}</h4>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                          report.report_type === 'lost'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {report.report_type}
                        </span>
                      </div>
                      
                      {/* Location & Date Details */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-450 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{report.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatDate(report.item_date)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-900/40 pt-3 sm:pt-0">
                    <span className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 bg-slate-900/40 border border-slate-850 rounded-lg">
                      {report.category}
                    </span>
                    <Link
                      to={`/search`}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 ml-5 inline-flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Tips & Guidelines (1/3 width) */}
        <div className="space-y-6">
          <div className="glass-card border border-slate-800/35 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-float" />
              <span>How Matching Works</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Our matching engine processes reports in real-time. It calculates similarities across four dimensions:
            </p>
            <ul className="space-y-3.5 text-xs text-slate-350">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                <span><strong>Category Match (30%)</strong>: Strict alignment on items category.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                <span><strong>Name Match (25%)</strong>: Tokenized string similarity comparisons.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                <span><strong>Description Keywords (25%)</strong>: Extracting distinct details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                <span><strong>Campus Location (20%)</strong>: Location proximity overlaps.</span>
              </li>
            </ul>
            <div className="mt-5 p-3.5 bg-slate-950/35 rounded-2xl border border-slate-850">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Matches with scores <strong>&gt;= 35%</strong> are generated automatically and placed in the Matches page!
              </p>
            </div>
          </div>

          <div className="glass-card border border-slate-800/35 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-slate-100 mb-3">Claiming Guidelines</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When contacting owners/finders:
            </p>
            <ul className="mt-3.5 space-y-2.5 text-xs text-slate-400 list-disc pl-4">
              <li>Meet in public campus areas (e.g., student center, library lobby).</li>
              <li>Ask for identifying marks, lock screen wallpaper, or credentials.</li>
              <li>Report any suspicious transactions to campus security.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
