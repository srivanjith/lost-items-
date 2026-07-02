import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Loader } from 'lucide-react';

export const RedirectPortal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dots, setDots] = useState('');

  const targetPath = searchParams.get('to') || '/dashboard';
  const customMessage = searchParams.get('msg') || 'Authenticating secure credentials';

  useEffect(() => {
    // Dot loading animation
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    // Redirect timeout
    const redirectTimeout = setTimeout(() => {
      navigate(targetPath, { replace: true });
    }, 1500);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate, targetPath]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[120px] -z-10 animate-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[120px] -z-10 animate-blob-2 pointer-events-none"></div>

      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Crest / University Branding */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="bg-gradient-to-b from-amber-500/10 to-amber-600/5 p-6 rounded-full border border-amber-500/20 shadow-xl gold-glow animate-pulse-slow">
              <Shield className="w-12 h-12 text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-800 p-1.5 rounded-full">
              <Loader className="w-4 h-4 text-amber-500 animate-spin" />
            </div>
          </div>
          
          <h1 className="text-xl font-bold tracking-widest text-slate-200 uppercase">
            Beacon State University
          </h1>
          <p className="text-[10px] uppercase font-bold text-amber-500/70 tracking-widest mt-1">
            SSO Gateway Integration
          </p>
        </div>

        {/* Central Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/[0.03] shadow-2xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-350">
              {customMessage}{dots}
            </p>
            <p className="text-xs text-slate-500">
              Do not refresh or close this browser session.
            </p>
          </div>

          {/* Progress Bar Animation */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 h-full rounded-full animate-charge w-0"></div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-600">
          Secure SSO connection established via TLS 1.3. Authorization managed by Campus IT Services.
        </p>
      </div>
    </div>
  );
};

export default RedirectPortal;
