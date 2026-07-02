import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Sparkles, Search, HelpCircle, MapPin, 
  ArrowRight, HeartHandshake, CheckCircle2, ChevronDown 
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  
  const faqs = [
    {
      q: "Who can use the Campus Property Recovery Hub?",
      a: "All active students, staff, faculty members, and authorized campus visitors with a valid registration or guest credential."
    },
    {
      q: "Where is the physical Lost & Found office located?",
      a: "The physical recovery vault is located at the Beacon Student Union, Room 102 (First Floor, next to Campus Security)."
    },
    {
      q: "What is the automatic matching algorithm?",
      a: "Our smart system compares reported items across category, location proximity, timestamps, and description keywords to calculate a match score. Scores above 35% are flagged for review."
    },
    {
      q: "How long are unclaimed items kept in the vault?",
      a: "Items are securely stored for 60 days. Unclaimed textbooks and electronics are donated to library services, while other properties are auctioned or recycled."
    }
  ];

  return (
    <div className="space-y-16 animate-fade-in-up">
      {/* 1. Scholastic Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/10 bg-gradient-to-b from-slate-950 to-slate-900/60 p-8 md:p-16 shadow-2xl">
        <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[150px] -z-10 animate-blob-1 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[100px] -z-10 animate-blob-2 pointer-events-none"></div>

        <div className="max-w-3xl space-y-6">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-550/10 border border-amber-500/20 text-xs font-bold tracking-wider text-amber-400 uppercase animate-float">
            <Shield className="w-3.5 h-3.5" />
            <span>Beacon State University</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Campus Property & <br />
            <span className="shimmer-text">Recovery Hub</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
            Welcome to the official, secure recovery network for lost belongings. Designed to synchronize student searches, match descriptions using smart heuristics, and coordinate claims under campus supervision.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-amber-500 via-amber-550 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-slate-950 font-extrabold py-3.5 px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer border border-amber-400/20"
              >
                <span>Enter Admin/Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-amber-500 via-amber-550 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-slate-950 font-extrabold py-3.5 px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer border border-amber-400/20"
                >
                  <span>Student SSO Sign-In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold py-3.5 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
                >
                  <span>Create Credentials</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stat Counter Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-white/[0.03] shadow-lg flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Claims Resolved</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100">1,240+</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
              <span>98% reunification</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Belongings safely reclaimed by verified campus residents.</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/[0.03] shadow-lg flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Match Accuracy</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100">Real-Time</span>
            <span className="text-xs text-amber-500 font-semibold flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-0.5" />
              <span>Smart Match Engine</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Processes description metrics, location overlap, and time logs instantly.</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/[0.03] shadow-lg flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Average Claim Speed</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100">&lt; 12 Hours</span>
            <span className="text-xs text-blue-400 font-semibold">Fast Response</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">From report notification to secure physical vault hand-back.</p>
        </div>
      </div>

      {/* 3. Steps - How it Works */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">The Recovery Workflow</h2>
          <p className="text-xs text-slate-400">Simple three-step verification process to ensure properties find their rightful owners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-3xl p-6 border border-white/[0.02] flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200">1. Search & Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log lost items immediately with exact description tags. Browse public archives to see if an matching record exists.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/[0.02] flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <h3 className="font-bold text-slate-200">2. Real-time Similarity Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our service scores reports. If coordinates and categories match closely, notifications are instantly queued for review.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/[0.02] flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200">3. Verification & Exchange</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify claims in public meeting areas. Bring matching serial codes, passwords, or descriptive details for confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Guidelines & Map Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Claim Guidelines */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>Vault Claiming & Security Regulations</span>
          </h3>

          <div className="space-y-4 text-xs leading-relaxed text-slate-400">
            <p>
              To keep our campus safe and prevent fraudulent assertions, Beacon State University enforces strict compliance with the following protocol when reclaiming properties:
            </p>
            <ul className="space-y-3 list-disc pl-4 text-slate-350">
              <li>
                <strong>Proof of Identity:</strong> You must present your official Student ID (SSO profile must match your registration).
              </li>
              <li>
                <strong>Detailed Validation:</strong> For electronics and computers, you will be required to input the correct lock code, serial matching number, or describe distinct cosmetic details.
              </li>
              <li>
                <strong>Security Monitoring:</strong> All physically completed exchanges at the Student Union room are logged and monitored under CCTV surveillance for safety.
              </li>
            </ul>
          </div>
        </div>

        {/* Location Info */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-200">Central Property Vault</h4>
            <p className="text-xs text-slate-400 mt-1">Visit during business hours for physical verification.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">Beacon Student Union</p>
                <p className="text-slate-500">Room 102, Main Floor, Beacon Campus</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 ml-1.5 flex-shrink-0"></span>
              <div>
                <p className="font-semibold text-slate-350">Hours of Operation</p>
                <p className="text-slate-500">Mon - Fri: 8:00 AM - 6:00 PM</p>
                <p className="text-slate-500">Sat - Sun: Closed</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-2xl text-[10px] text-slate-500">
            <strong>Urgent Claims:</strong> For keys, medication, or medical gear, contact Campus Police immediately at ext. 4900.
          </div>
        </div>
      </div>

      {/* 5. FAQs */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-100 text-center">Frequently Asked Questions</h3>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl p-5 border border-white/[0.02] space-y-2 hover:border-amber-500/10 transition-colors">
              <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400/80 flex-shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
