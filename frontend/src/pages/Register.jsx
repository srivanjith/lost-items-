import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, User, Mail, Lock, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'College email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s-()]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    // Send data to backend. We omit confirmPassword from backend submission
    const { confirmPassword, ...submitData } = formData;
    const result = await register(submitData);
    setSubmitting(false);

    if (result.success) {
      showToast('Registration successful! Welcome.', 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-float"></div>
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-indigo-600/20 p-2.5 rounded-2xl border border-indigo-500/30 mb-2 animate-bounce">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-slate-100">
            CAMPUS<span className="text-indigo-400 font-extrabold">RETRIEVE</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest text-[9px] bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800/60 mt-2">
            Register your student account
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-card border border-slate-800/40 rounded-3xl p-6 shadow-2xl">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-405 font-bold mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          
          <h2 className="text-lg font-bold text-slate-100 mb-5 text-center">Create a New Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alice Johnson"
                  className={`w-full bg-slate-950/50 border rounded-xl py-2.5 pl-9 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.name && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                  placeholder="alice@college.edu"
                  className={`w-full bg-slate-950/50 border rounded-xl py-2.5 pl-9 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={`w-full bg-slate-950/50 border rounded-xl py-2.5 pl-9 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.phone}</p>}
            </div>

            {/* Role & Permissions Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Account Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldAlert className="h-4 w-4 text-slate-500" />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500/60 rounded-xl py-2.5 pl-9 pr-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm cursor-pointer"
                >
                  <option value="student">Student / Reporter</option>
                  <option value="admin">Administrator Moderator</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                  className={`w-full bg-slate-950/50 border rounded-xl py-2.5 pl-9 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.password && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-950/50 border rounded-xl py-2.5 pl-9 pr-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm ${
                    errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-800/80 focus:border-indigo-500/60'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 disabled:from-indigo-700 disabled:to-purple-750 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm mt-3 cursor-pointer border border-indigo-500/10"
            >
              {submitting ? (
                <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;
