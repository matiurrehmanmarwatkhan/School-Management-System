import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { School, Eye, EyeOff, ShieldCheck, GraduationCap, Users, UserCheck, ArrowRight, CheckCircle2, Receipt } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const { settings, addToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const success = login(email);
    if (success) {
      addToast('success', 'Logged in successfully');
      // Redirect based on current role
      const users = JSON.parse(localStorage.getItem('edumanage_users_v1') || '[]');
      const matched = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      const targetRole = matched ? matched.role : 'admin';
      navigate(`/${targetRole}/dashboard`);
    } else {
      // Fallback demo: check if password matches role
      if (email.includes('admin')) {
        demoLogin('admin');
        navigate('/admin/dashboard');
      } else if (email.includes('teacher')) {
        demoLogin('teacher');
        navigate('/teacher/dashboard');
      } else if (email.includes('parent')) {
        demoLogin('parent');
        navigate('/parent/dashboard');
      } else if (email.includes('student')) {
        demoLogin('student');
        navigate('/student/dashboard');
      } else if (email.includes('accountant')) {
        demoLogin('accountant');
        navigate('/accountant/dashboard');
      } else {
        setErrorMessage('Invalid credentials. Use one of the Demo One-Click Access buttons below or demo accounts.');
      }
    }
  };

  const handleDemoAccess = (role: 'admin' | 'teacher' | 'parent' | 'student' | 'accountant') => {
    demoLogin(role);
    addToast('success', `Signed in as Demo ${role.toUpperCase()}`);
    navigate(`/${role}/dashboard`);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setIsForgotPasswordOpen(false);
      setForgotEmail('');
      addToast('info', 'Demo password reset instructions simulated for ' + forgotEmail);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md mb-3">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {settings.name}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {settings.motto}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-900/50">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email / Username
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@school.edu"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400">
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Portal Access */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant One-Click Demo Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccess('admin')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Admin</div>
                  <div className="text-[10px] text-slate-400 truncate">admin@school.edu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('teacher')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Teacher</div>
                  <div className="text-[10px] text-slate-400 truncate">Mr. Tariq Mahmood</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('parent')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Parent</div>
                  <div className="text-[10px] text-slate-400 truncate">Muhammad Imran</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('student')}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Student</div>
                  <div className="text-[10px] text-slate-400 truncate">Bilal Imran (10-A)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('accountant')}
                className="col-span-2 flex items-center gap-2 p-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-colors text-left"
              >
                <div className="p-1.5 rounded-md bg-blue-600 text-white">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>Accountant Portal</span>
                    <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] rounded font-bold uppercase">PKR Fees</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Muhammad Arif · accountant@school.edu</div>
                </div>
              </button>
            </div>
            <div className="mt-3 text-center text-[11px] text-slate-400">
              Demo passwords: <span className="font-mono text-slate-600 dark:text-slate-300">admin123</span> / <span className="font-mono text-slate-600 dark:text-slate-300">accountant123</span> / <span className="font-mono text-slate-600 dark:text-slate-300">teacher123</span> / <span className="font-mono text-slate-600 dark:text-slate-300">parent123</span> / <span className="font-mono text-slate-600 dark:text-slate-300">student123</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Frontend Demonstration Mode · Data persisted in LocalStorage
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        title="Reset Password"
        description="Demo password recovery flow"
        maxWidth="sm"
      >
        {forgotSent ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recovery Link Sent
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              In this frontend demo, a simulated recovery link has been dispatched to {forgotEmail}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter your registered school email address below to receive demo password reset instructions.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="user@school.edu"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
