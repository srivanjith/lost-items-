import React, { useState, useEffect } from 'react';
import { adminService, UPLOAD_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, User, FileText, Trash2, HelpCircle, 
  MapPin, Calendar, Mail, Phone, Clock
} from 'lucide-react';

export const AdminPanel = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'users'

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await adminService.getUsers();
      const reportsRes = await adminService.getReports();

      if (usersRes.success && reportsRes.success) {
        setUsers(usersRes.users);
        setReports(reportsRes.reports);
      } else {
        showToast('Failed to load administrator data sheets.', 'error');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Error connecting to backend services.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [showToast]);

  const handleDeleteReport = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} report? This action is permanent.`)) {
      return;
    }

    try {
      const response = await adminService.deleteReport(id, type);
      if (response.success) {
        showToast('Report deleted successfully.', 'success');
        // Refresh local data
        fetchAdminData();
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showToast('Error deleting report.', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-900/60 rounded-3xl border border-slate-800/60"></div>
        <div className="h-96 bg-slate-900/60 rounded-3xl border border-slate-800/60"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl"></div>
        <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-100">Administrator Moderation Console</h1>
          <p className="text-xs text-slate-400">Manage campus users, monitor statistics, and delete offending reports.</p>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-indigo-650 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>System Reports ({reports.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-650 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl shadow-xl overflow-hidden">
        {activeTab === 'reports' ? (
          /* Reports Moderation Catalog */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-850">
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Item details</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Reporter details</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Date reported</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                      No reports filed in system databases.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={`${report.report_type}-${report.id}`} className="hover:bg-slate-950/20 transition-colors">
                      {/* Name / Category */}
                      <td className="py-4 px-6 space-y-1">
                        <p className="font-bold text-slate-200">{report.item_name}</p>
                        <p className="text-[10px] text-slate-500">{report.category}</p>
                      </td>
                      
                      {/* Type Badge */}
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          report.report_type === 'lost'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {report.report_type}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="py-4 px-6 space-y-1">
                        <p className="font-medium text-slate-305">{report.reporter_name}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span>{report.reporter_email}</span>
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          report.status === 'resolved'
                            ? 'bg-slate-850 border-slate-750 text-slate-500'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {report.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-400">
                        {formatDate(report.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteReport(report.id, report.report_type)}
                          className="bg-rose-500/10 hover:bg-rose-650/20 border border-rose-500/20 text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
                          title="Delete spam/duplicate report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* User Accounts Manifest */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-850">
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Email address</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Phone number</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Role privilege</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider">Registered on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {users.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-950/20 transition-colors">
                    {/* User profile */}
                    <td className="py-4 px-6 font-bold text-slate-200 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{account.name}</span>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-slate-350">
                      {account.email}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-slate-400">
                      {account.phone}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        account.role === 'admin'
                          ? 'bg-rose-500/10 border-rose-500/25 text-rose-455'
                          : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-455'
                      }`}>
                        {account.role}
                      </span>
                    </td>

                    {/* Reg Date */}
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(account.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPanel;
