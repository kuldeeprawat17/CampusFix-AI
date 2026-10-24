import React from 'react';
import { Wrench, Shield, User as UserIcon, Bot, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenReportModal: () => void;
  onOpenChat: () => void;
  onOpenPilotModal: () => void;
  onLogin: () => void;
  onLogout: () => void;
  isFirebaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isAdmin,
  onToggleAdmin,
  onOpenReportModal,
  onOpenChat,
  onOpenPilotModal,
  onLogin,
  onLogout,
  isFirebaseConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-inner font-black text-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">CampusFix</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Centralized Smart Campus Infrastructure Platform</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Judges Pilot Roadmap Button */}
          <button
            onClick={onOpenPilotModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Pitch & Pilot Roadmap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilot Roadmap</span>
          </button>

          {/* AI Chatbot Assistant */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 transition"
            aria-label="Open AI Assistant"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Ask AI Bot</span>
          </button>

          {/* Admin Mode Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition border ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Admin & Maintenance Staff View"
          >
            <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{isAdmin ? 'Staff Mode ON' : 'Student Mode'}</span>
          </button>

          {/* New Complaint Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
          >
            <span>+ Report Issue</span>
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div
                className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-slate-200 overflow-hidden"
                title={user.email || 'Logged in user'}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
