import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService, lostService, foundService, matchService, UPLOAD_URL } from '../services/api';
import { auth } from '../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { 
  User, Mail, Phone, Lock, Save, Trash2, CheckCircle2, 
  HelpCircle, Calendar, MapPin, Sparkles, Shield, EyeOff, X, AlertCircle
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Reported Items lists
  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'

  // AI Scan modal states
  const [aiScanLostItem, setAiScanLostItem] = useState(null);
  const [aiMatches, setAiMatches] = useState([]);
  const [loadingAIMatches, setLoadingAIMatches] = useState(false);
  const [activeAIContactId, setActiveAIContactId] = useState(null);

  const fetchUserReports = async () => {
    setLoadingItems(true);
    try {
      // Get all reports and filter by ownership on client (or server-side).
      // Since lost-items and found-items accept queries, we can get them all and filter.
      // Wait, `/api/lost-items` and `/api/found-items` return paginate active ones.
      // Let's call them with status: 'all' to get resolved ones too, and filter by user_id!
      const lostRes = await lostService.getAll({ status: 'all', limit: 100 });
      const foundRes = await foundService.getAll({ status: 'all', limit: 100 });

      if (lostRes.success && foundRes.success) {
        // Filter where user_id === user.id
        const myLost = lostRes.items.filter(item => item.user_id === user.id);
        const myFound = foundRes.items.filter(item => item.user_id === user.id);
        setLostReports(myLost);
        setFoundReports(myFound);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Error loading reported items.', 'error');
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      fetchUserReports();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email || !profileData.phone) {
      showToast('Please fill all required profile fields.', 'error');
      return;
    }

    setUpdatingProfile(true);
    try {
      // Handle Firebase password updates if requested
      if (profileData.newPassword) {
        if (!profileData.currentPassword) {
          showToast('Current password is required to change password.', 'error');
          setUpdatingProfile(false);
          return;
        }
        if (profileData.newPassword !== profileData.confirmNewPassword) {
          showToast('New passwords do not match.', 'error');
          setUpdatingProfile(false);
          return;
        }
        if (profileData.newPassword.length < 6) {
          showToast('New password must be at least 6 characters.', 'error');
          setUpdatingProfile(false);
          return;
        }

        try {
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const credential = EmailAuthProvider.credential(firebaseUser.email, profileData.currentPassword);
            await reauthenticateWithCredential(firebaseUser, credential);
            await updatePassword(firebaseUser, profileData.newPassword);
            showToast('Firebase password updated successfully.', 'success');
          }
        } catch (firebaseError) {
          console.error('Firebase password change error:', firebaseError);
          let errorMsg = 'Failed to update password in Firebase.';
          if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
            errorMsg = 'Incorrect current password.';
          }
          showToast(errorMsg, 'error');
          setUpdatingProfile(false);
          return;
        }
      }

      // Sync metadata changes (name, email, phone) to local database
      const { confirmNewPassword, currentPassword, newPassword, ...submitData } = profileData;
      const response = await userService.updateProfile(submitData);
      if (response.success) {
        showToast('Profile data saved successfully!', 'success');
        updateUserProfile(response.user);
        // Reset password parameters
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile details.';
      showToast(msg, 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleResolveItem = async (id, type) => {
    try {
      let response;
      if (type === 'lost') {
        response = await lostService.update(id, { status: 'resolved' });
      } else {
        response = await foundService.update(id, { status: 'resolved' });
      }

      if (response.success) {
        showToast('Item marked as resolved. Matches cleared.', 'success');
        fetchUserReports();
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      console.error('Error resolving item:', error);
      showToast('Error marking item as resolved.', 'error');
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this report? This action is permanent.')) {
      return;
    }

    try {
      let response;
      if (type === 'lost') {
        response = await lostService.delete(id);
      } else {
        response = await foundService.delete(id);
      }

      if (response.success) {
        showToast('Report deleted successfully.', 'success');
        fetchUserReports();
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('Error deleting item report.', 'error');
    }
  };

  const handleAISimilarScan = async (lostItem) => {
    setAiScanLostItem(lostItem);
    setAiMatches([]);
    setLoadingAIMatches(true);
    setActiveAIContactId(null);
    try {
      const response = await matchService.getAIComparedMatches(lostItem.id);
      if (response.success) {
        setAiMatches(response.matches);
      } else {
        showToast('AI Similarity scanning failed.', 'error');
      }
    } catch (error) {
      console.error('AI comparison error:', error);
      showToast('Error during AI comparison.', 'error');
    } finally {
      setLoadingAIMatches(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Edit Profile details (1/3 width) */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl h-fit space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <User className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-100">Personal Information</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 my-4 pt-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Change Password (Optional)
            </span>

            {/* Current Password */}
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={profileData.currentPassword}
                    onChange={handleProfileChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-855 rounded-xl py-2 px-8 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleProfileChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-855 rounded-xl py-2 px-8 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={profileData.confirmNewPassword}
                    onChange={handleProfileChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-855 rounded-xl py-2 px-8 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-750 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all hover:scale-[1.02]"
          >
            {updatingProfile ? (
              <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: User's reported items lists (2/3 width) */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-855 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>My Reported Items</span>
          </h3>

          {/* Tabs switch */}
          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('lost')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lost'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-455 shadow'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Lost Reports ({lostReports.length})
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'found'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-455 shadow'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Found Reports ({foundReports.length})
            </button>
          </div>
        </div>

        {/* List Content */}
        {loadingItems ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-slate-950/40 rounded-2xl border border-slate-850/60"></div>
            ))}
          </div>
        ) : (
          (() => {
            const reports = activeTab === 'lost' ? lostReports : foundReports;
            if (reports.length === 0) {
              return (
                <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-slate-850 border-dashed">
                  <EyeOff className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">No reports filed in this category</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Use the quick actions on your dashboard to submit a new report.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {reports.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-slate-800"
                  >
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={`${UPLOAD_URL}/${item.image}`} 
                            alt={item.item_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HelpCircle className="w-6 h-6 text-slate-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-200 text-sm">{item.item_name}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            item.status === 'resolved'
                              ? 'bg-slate-800 border-slate-700 text-slate-400'
                              : activeTab === 'lost'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-550 flex-shrink-0" />
                            <span>{item.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-550 flex-shrink-0" />
                            <span>{formatDate(activeTab === 'lost' ? item.date_lost : item.date_found)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0">
                      {activeTab === 'lost' && item.status !== 'resolved' && (
                        <button
                          onClick={() => handleAISimilarScan(item)}
                          className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Compare with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-350" />
                          <span>AI Scan</span>
                        </button>
                      )}
                      {item.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveItem(item.id, activeTab)}
                          className="bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteItem(item.id, activeTab)}
                        className="bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {/* AI Similarity Scan Modal */}
      {aiScanLostItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-400/30 backdrop-blur-md">
          <div className="bg-white border border-slate-700/60 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up flex flex-col max-h-[85vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setAiScanLostItem(null)}
              className="absolute top-4 right-4 z-10 bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-500 hover:text-slate-355 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/40 bg-slate-950/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AI Similarity Scanner</span>
              </span>
              <h3 className="text-lg font-extrabold text-slate-350 mt-3">
                Scanning Matches for: <span className="text-amber-500">"{aiScanLostItem.item_name}"</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Analyzing lost details against database of reported found items.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {loadingAIMatches ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  {/* Radar Scanner Animation */}
                  <div className="relative w-20 h-20 animate-pulse">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-indigo-500/60 animate-ping"></div>
                    <div className="absolute inset-4 rounded-full bg-indigo-650 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <Sparkles className="w-6 h-6 text-white animate-spin" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-350 animate-pulse">AI Engine Analysing Listings...</p>
                    <p className="text-[10px] text-slate-500">Cross-referencing synonyms, categories, locations, and dates</p>
                  </div>
                </div>
              ) : aiMatches.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-slate-700 border-dashed">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-350 text-sm font-semibold">No AI Matches Identified</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Gemini was unable to verify any found listings that resemble this lost item.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-indigo-650">
                    Ranked AI Similarity Results ({aiMatches.length})
                  </p>
                  <div className="space-y-4">
                    {aiMatches.map((match) => {
                      const score = match.match_score;
                      const isContactActive = activeAIContactId === match.found_item.id;
                      
                      let scoreBadgeClass = "text-indigo-650 bg-indigo-500/10 border-indigo-500/20";
                      if (score >= 80) scoreBadgeClass = "text-emerald-650 bg-emerald-500/10 border-emerald-500/20";
                      else if (score >= 50) scoreBadgeClass = "text-amber-650 bg-amber-500/10 border-amber-500/20";

                      return (
                        <div 
                          key={match.found_item.id} 
                          className="bg-white border border-slate-700/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/10 pb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${scoreBadgeClass}`}>
                                {score}% AI MATCH
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950 px-2.5 py-0.5 rounded">
                                {match.confidence} confidence
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveAIContactId(isContactActive ? null : match.found_item.id)}
                              className="bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded-lg shadow transition-colors cursor-pointer self-end sm:self-auto"
                            >
                              {isContactActive ? 'Hide Finder' : 'Contact Finder'}
                            </button>
                          </div>

                          <div className="flex gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {match.found_item.image ? (
                                <img 
                                  src={`${UPLOAD_URL}/${match.found_item.image}`} 
                                  alt={match.found_item.item_name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <HelpCircle className="w-6 h-6 text-slate-650" />
                              )}
                            </div>

                            {/* Found item details */}
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-350 text-sm">{match.found_item.item_name}</h4>
                              <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-550">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-indigo-500" />
                                  <span>{match.found_item.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-indigo-500" />
                                  <span>{formatDate(match.found_item.date_found)}</span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-1 mt-1 leading-relaxed">
                                {match.found_item.description}
                              </p>
                            </div>
                          </div>

                          {/* AI Analysis Paragraph */}
                          <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl">
                            <p className="text-xs text-slate-455 italic leading-relaxed">
                              <strong>AI Assessment:</strong> {match.match_analysis}
                            </p>
                          </div>

                          {/* Sliding Contact info */}
                          {isContactActive && (
                            <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs space-y-1.5 animate-slide-down">
                              <p className="font-bold text-slate-350">Claim from Finder:</p>
                              <div className="text-slate-555 space-y-1 pt-0.5">
                                <p><strong>Name:</strong> {match.found_item.finder.name}</p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  <a href={`mailto:${match.found_item.finder.email}`} className="text-indigo-650 hover:underline">
                                    {match.found_item.finder.email}
                                  </a>
                                </p>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  <a href={`tel:${match.found_item.finder.phone}`} className="text-indigo-650 hover:underline">
                                    {match.found_item.finder.phone}
                                  </a>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700/40 bg-slate-950/30 flex justify-end">
              <button
                onClick={() => setAiScanLostItem(null)}
                className="bg-slate-900 border border-slate-750 text-slate-350 hover:bg-slate-850 font-bold text-xs py-2 px-5 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Profile;
