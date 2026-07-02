import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService, UPLOAD_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Search as SearchIcon, Filter, MapPin, Calendar, 
  HelpCircle, AlertCircle, Eye, X, Phone, Mail, User
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Keys & Cards',
  'Clothing & Accessories',
  'Bags & Wallets',
  'Others'
];

export const Search = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states loaded from URL query params
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || 'all'
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  // Update filters if search parameters change (e.g., clicking quicklinks on Dashboard)
  useEffect(() => {
    const queryParam = searchParams.get('query') || '';
    const categoryParam = searchParams.get('category') || '';
    const locationParam = searchParams.get('location') || '';
    const typeParam = searchParams.get('type') || 'all';

    setFilters({
      query: queryParam,
      category: categoryParam,
      location: locationParam,
      type: typeParam
    });
  }, [searchParams]);

  // Execute Search query
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchService.search(filters);
      if (response.success) {
        setItems(response.items);
      } else {
        showToast('Failed to fetch search catalog.', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('Error searching catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run search on mount and when filters state changes
  useEffect(() => {
    handleSearch();
  }, [filters.type, filters.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplySearch = (e) => {
    e.preventDefault();
    // Sync to URL
    const params = {};
    if (filters.query) params.query = filters.query;
    if (filters.category) params.category = filters.category;
    if (filters.location) params.location = filters.location;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    setSearchParams(params);
    handleSearch();
  };

  const handleReset = () => {
    const resetFilters = { query: '', category: '', location: '', type: 'all' };
    setFilters(resetFilters);
    setSearchParams({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          Campus Catalog <SearchIcon className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400">Search and filter reported items across the university campus</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar (1/4 Width) */}
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl h-fit space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100">Filter Search</h3>
          </div>

          <form onSubmit={handleApplySearch} className="space-y-5">
            {/* Search Query */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Keywords
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="query"
                  value={filters.query}
                  onChange={handleChange}
                  placeholder="e.g., iPhone, wallet, keys"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Catalog Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Report Type
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 border border-slate-850 p-1 rounded-xl">
                {['all', 'lost', 'found'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, type: t }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filters.type === t
                        ? 'bg-indigo-650 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Campus Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="e.g., Library, Gym"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/25 cursor-pointer transition-all hover:scale-[1.02]"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Catalog Grid (3/4 Width) */}
        <div className="lg:col-span-3 space-y-4">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-72 bg-slate-900/60 rounded-3xl border border-slate-850/60"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-slate-905 border border-slate-855 rounded-3xl border-dashed">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-300">No Items Found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                No matching reports were found. Try modifying your keywords or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <div 
                  key={`${item.report_type}-${item.id}`}
                  className="bg-slate-905 hover:bg-slate-900 border border-slate-855 hover:border-slate-800 rounded-3xl shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Item Image Card Header */}
                  <div className="h-40 bg-slate-950/60 relative overflow-hidden flex items-center justify-center border-b border-slate-850">
                    {item.image ? (
                      <img 
                        src={`${UPLOAD_URL}/${item.image}`} 
                        alt={item.item_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <HelpCircle className="w-10 h-10" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Report Type Badge */}
                    <span className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-md ${
                      item.report_type === 'lost'
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {item.report_type}
                    </span>
                  </div>

                  {/* Item Details Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-850 rounded">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-slate-200 line-clamp-1 text-sm sm:text-base pt-1">{item.item_name}</h4>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-850">
                      <div className="flex flex-col gap-1.5 text-[11px] text-slate-450">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{formatDate(item.item_date)}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedItem(item)}
                        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Inspect Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Inspection Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Close Modal Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-slate-950/70 border border-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Modal Left Side (Image) */}
              <div className="bg-slate-950 flex items-center justify-center h-64 md:h-full relative min-h-[250px] border-r border-slate-850">
                {selectedItem.image ? (
                  <img 
                    src={`${UPLOAD_URL}/${selectedItem.image}`} 
                    alt={selectedItem.item_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center gap-2">
                    <HelpCircle className="w-12 h-12" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">No Image Available</span>
                  </div>
                )}
                
                {/* Float Report Badge */}
                <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-md ${
                  selectedItem.report_type === 'lost'
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}>
                  {selectedItem.report_type}
                </span>
              </div>

              {/* Modal Right Side (Content details) */}
              <div className="p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 px-2 py-0.5 bg-slate-950 border border-slate-850 rounded">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-100">{selectedItem.item_name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-h-[120px] overflow-y-auto pr-2">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  {/* Proximity metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Location</span>
                      <span className="flex items-center gap-1 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{selectedItem.location}</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Date Reported</span>
                      <span className="flex items-center gap-1 text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>{formatDate(selectedItem.item_date)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Reporter Contact Form */}
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-2">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Contact Reporter</span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-350">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedItem.reporter_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-350">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <a href={`mailto:${selectedItem.reporter_email}`} className="text-indigo-400 hover:underline">{selectedItem.reporter_email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-350">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <a href={`tel:${selectedItem.reporter_phone}`} className="text-indigo-400 hover:underline">{selectedItem.reporter_phone}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Search;
