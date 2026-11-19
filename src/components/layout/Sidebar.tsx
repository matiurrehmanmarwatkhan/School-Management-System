import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  Bell,
  Award,
  BookMarked,
  UserCircle,
  X,
  School,
  Receipt,
  History,
  AlertCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed }) => {
  const { role } = useAuth();
  const { settings } = useApp();

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/teachers', label: 'Teachers', icon: UserCheck },
    { to: '/admin/parents', label: 'Parents', icon: Users },
    { to: '/admin/classes', label: 'Classes & Sections', icon: Building2 },
    { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/admin/academic-sessions', label: 'Academic Sessions', icon: Calendar },
    { to: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
    { to: '/admin/fees', label: 'Fee Management', icon: CreditCard },
    { to: '/admin/tests', label: 'Tests & Marks', icon: FileSpreadsheet },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/users', label: 'Users & Roles', icon: ShieldCheck },
    { to: '/admin/settings', label: 'School Settings', icon: Settings },
  ];

  const teacherNavItems = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/classes', label: 'My Classes', icon: Building2 },
    { to: '/teacher/attendance', label: 'Student Attendance', icon: ClipboardCheck },
    { to: '/teacher/tests', label: 'Tests & Grading', icon: FileSpreadsheet },
    { to: '/teacher/results', label: 'Published Results', icon: Award },
    { to: '/teacher/profile', label: 'My Profile', icon: UserCircle },
  ];

  const parentNavItems = [
    { to: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parent/children', label: 'My Children', icon: GraduationCap },
    { to: '/parent/attendance', label: 'Attendance', icon: ClipboardCheck },
    { to: '/parent/fees', label: 'Fee Challans', icon: CreditCard },
    { to: '/parent/results', label: 'Exam Results', icon: Award },
    { to: '/parent/notices', label: 'School Notices', icon: Bell },
    { to: '/parent/profile', label: 'My Profile', icon: UserCircle },
  ];

  const studentNavItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: UserCircle },
    { to: '/student/attendance', label: 'My Attendance', icon: ClipboardCheck },
    { to: '/student/results', label: 'My Results', icon: Award },
    { to: '/student/fees', label: 'My Fees', icon: CreditCard },
    { to: '/student/notices', label: 'Notice Board', icon: BookMarked },
  ];

  const accountantNavItems = [
    { to: '/accountant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accountant/fees', label: 'Fee Overview', icon: CreditCard },
    { to: '/accountant/record-payment', label: 'Record Payment', icon: Receipt },
    { to: '/accountant/payments', label: 'Payment History', icon: History },
    { to: '/accountant/outstanding', label: 'Outstanding Fees', icon: AlertCircle },
    { to: '/accountant/reports', label: 'Fee Reports', icon: BarChart3 },
    { to: '/accountant/students', label: 'Student Fee Ledgers', icon: GraduationCap },
  ];

  let currentNavItems = adminNavItems;
  if (role === 'teacher') currentNavItems = teacherNavItems;
  else if (role === 'parent') currentNavItems = parentNavItems;
  else if (role === 'student') currentNavItems = studentNavItems;
  else if (role === 'accountant') currentNavItems = accountantNavItems;

  const roleLabel = {
    admin: 'Admin Portal',
    teacher: 'Teacher Portal',
    parent: 'Parent Portal',
    student: 'Student Portal',
    accountant: 'Accountant Portal',
  }[role || 'admin'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold tracking-wider shrink-0 shadow-xs">
              <School className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                  {settings.name}
                </div>
                <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 capitalize">
                  {roleLabel}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Role Indicator */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">Active: {settings.currency} Currency Mode</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
