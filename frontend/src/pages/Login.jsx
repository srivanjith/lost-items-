import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Campus email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const result = await login(formData);
    setSubmitting(false);

    if (result.success) {
      showToast('Authentication successful.', 'success');
      // Redirect using the transitional portal
      navigate('/redirect?to=/dashboard&msg=Verifying university SSO credentials');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

      <div className="max-w-md w-full animate-fade-in">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-amber-550/15 p-3.5 rounded-2xl border border-amber-500/30 mb-3.5 animate-bounce">
            <Shield className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-slate-200 uppercase">
            Beacon State University
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 uppercase font-bold tracking-widest text-[9px] bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800/60">
            Single Sign-On (SSO) Portal
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-card border border-amber-500/15 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 mb-6 text-center">Secure Gateway Authentication</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@beacon.edu"
                  className={`w-full bg-slate-950/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all text-sm ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800 focus:border-amber-500/50'
                  }`}
                />
              </div>
              {errors.email && <p className="text-rose-550 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Portal Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-950/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all text-sm ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800 focus:border-amber-500/50'
                  }`}
                />
              </div>
              {errors.password && <p className="text-rose-550 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-amber-400/20"
            >
              {submitting ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-900 text-center">
            <p className="text-xs text-slate-400">
              New student/staff member?{' '}
              <Link to="/register" className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 hover:underline">
                <span>Create profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
