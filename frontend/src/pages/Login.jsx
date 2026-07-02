import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

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
      newErrors.email = 'Email is required';
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
      showToast('Welcome back! Login successful.', 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-md w-full animate-fade-in">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-indigo-600/20 p-3.5 rounded-2xl border border-indigo-500/30 mb-3.5 animate-bounce">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider text-slate-100">
            CAMPUS<span className="text-indigo-400">RETRIEVE</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest text-[9px] bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800/60 mt-2">
            University Single Sign-On (SSO)
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-card border border-slate-800/40 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-100 mb-6 text-center">Sign In to Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                College Email
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
                  placeholder="name@college.edu"
                  className={`w-full bg-slate-950/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
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
                  className={`w-full bg-slate-950/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 disabled:from-indigo-700 disabled:to-purple-750 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-indigo-500/10"
            >
              {submitting ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-900/60 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-350 font-bold inline-flex items-center gap-1 hover:underline">
                <span>Create one</span>
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
