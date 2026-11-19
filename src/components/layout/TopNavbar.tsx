import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
  User,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, role, logout, demoLogin } = useAuth();
  const { settings, updateSettings, sessions, currentSession, switchCurrentSession, notices, resetAllData } = useApp();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (newRole: 'admin' | 'teacher' | 'parent' | 'student' | 'accountant') => {
    demoLogin(newRole);
    setIsRoleMenuOpen(false);
    navigate(`/${newRole}/dashboard`);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  // Filter notices for this user
  const relevantNotices = notices.filter(
    (n) => !role || n.targetRoles.includes(role)
  );

  return (
    <>
      <header className="h-16 px-4 lg:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Zone 1: Toggle & Session Pill */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Academic Session Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Session:</span>
            <select
              value={currentSession?.id}
              onChange={(e) => switchCurrentSession(e.target.value)}
              className="py-1 px-2 font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md border-none focus:ring-1 focus:ring-blue-500 text-xs cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone 2: Fast Role Switcher for seamless evaluation */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              title="Quickly switch between all 5 portals"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="capitalize font-semibold">{role || 'Select'} Portal</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Portal View
                </div>
                {(['admin', 'teacher', 'parent', 'student', 'accountant'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleSwitchRole(r)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between capitalize transition-colors ${
                      role === r
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r} Portal</span>
                    {role === r && <span className="text-[10px] text-blue-500">Current</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset demo data to initial defaults"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle color theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {relevantNotices.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Notices & Announcements
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {relevantNotices.length} Active
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {relevantNotices.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No announcements at this time.
                    </div>
                  ) : (
                    relevantNotices.map((n) => (
                      <div key={n.id} className="p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {n.content}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{n.category}</span>
                          <span>·</span>
                          <span>{n.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser?.name?.split(' ')[0] || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {currentUser?.role || 'Guest'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {currentUser?.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate(`/${role}/dashboard`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate(`/${role === 'admin' ? 'admin/settings' : role + '/profile'}`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Dialog for Resetting Data */}
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetAllData}
        title="Reset Demo Data?"
        message="This will restore all student records, fee challans, test marks, and attendance logs to the default seed state. Any changes made during your session will be reverted."
        confirmLabel="Reset Everything"
        isDestructive={true}
      />
    </>
  );
};
