import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Upload, X, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Keys & Cards',
  'Clothing & Accessories',
  'Bags & Wallets',
  'Others'
];

export const ReportFound = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    description: '',
    location: '',
    date_found: '',
    contact_number: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB.', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.item_name.trim()) newErrors.item_name = 'Item name is required';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Found location is required';
    if (!formData.date_found) newErrors.date_found = 'Date found is required';
    
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    } else {
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(formData.contact_number.replace(/[\s-()]/g, ''))) {
        newErrors.contact_number = 'Enter a valid contact number (7-15 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    const submitData = new FormData();
    submitData.append('item_name', formData.item_name);
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    submitData.append('location', formData.location);
    submitData.append('date_found', formData.date_found);
    submitData.append('contact_number', formData.contact_number);
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const result = await foundService.create(submitData);
      if (result.success) {
        showToast('Found item reported. Matches are being calculated!', 'success');
        navigate('/');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit report. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back navigation header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:text-indigo-400 hover:bg-slate-850 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            Report Found Item <AlertCircle className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400">File a report for an item you found on campus</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column Fields */}
            <div className="space-y-5">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  placeholder="e.g., Black leather wallet with student ID"
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.item_name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {errors.item_name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.item_name}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer ${
                    errors.category ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.category}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Where did you find it?
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Library 2nd floor, Science Hall Corridor"
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.location ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {errors.location && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.location}</p>}
              </div>

              {/* Date Found */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Date Found
                </label>
                <input
                  type="date"
                  name="date_found"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.date_found}
                  onChange={handleChange}
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer ${
                    errors.date_found ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {errors.date_found && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.date_found}</p>}
              </div>
            </div>

            {/* Right Column Fields */}
            <div className="space-y-5 flex flex-col justify-between">
              {/* Contact Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="e.g., +1234567890"
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.contact_number ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {errors.contact_number && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.contact_number}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Item Description
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide distinct keywords e.g. details of cards inside, stickers on items, case color."
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                    errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                ></textarea>
                {errors.description && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Upload Item Image (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 overflow-hidden group">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-slate-950/80 hover:bg-rose-600 border border-slate-800 p-2 rounded-xl text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-full border-2 border-slate-850 hover:border-indigo-500 border-dashed rounded-3xl p-8 text-center bg-slate-950/40 hover:bg-slate-950/80 cursor-pointer transition-all flex flex-col items-center group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-300">Click to upload item photo</p>
                <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WEBP files up to 5MB are accepted</p>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-850 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-750 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/35 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              {submitting ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ReportFound;
