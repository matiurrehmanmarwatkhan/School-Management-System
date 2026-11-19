import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  GraduationCap,
  CheckCircle2,
  Award,
  CreditCard,
  BookOpen,
  ChevronRight,
  Bell,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, classes, attendance, fees, tests, notices, settings } = useApp();
  const navigate = useNavigate();

  // Find linked student
  const currentStudent = students.find(
    (s) => s.id === currentUser?.linkedEntityId || s.email === currentUser?.email
  ) || students[0]; // Default to Bilal Imran

  const currentClass = classes.find((c) => c.id === currentStudent.classId);
  const currentSection = currentClass?.sections.find((s) => s.id === currentStudent.sectionId);

  // Attendance metrics
  const myAttendance = attendance.filter((a) => a.studentId === currentStudent.id);
  const present = myAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((present / myAttendance.length) * 100) : 96;

  // Fee status
  const myFees = fees.filter((f) => f.studentId === currentStudent.id);
  const totalBalance = myFees.reduce((sum, f) => sum + f.balance, 0);

  // Published test results only
  const publishedTests = useMemo(() => {
    return tests
      .filter((t) => t.status === 'published' && t.marks.some((m) => m.studentId === currentStudent.id))
      .map((t) => {
        const mark = t.marks.find((m) => m.studentId === currentStudent.id)!;
        return {
          title: t.title,
          total: t.totalMarks,
          obtained: mark.marksObtained,
          percentage: mark.percentage,
          grade: mark.grade,
          remarks: mark.remarks,
          date: t.date,
        };
      })
      .slice(0, 4);
  }, [tests, currentStudent.id]);

  // Chart data
  const chartData = publishedTests.map((t) => ({
    name: t.title.length > 16 ? t.title.substring(0, 14) + '..' : t.title,
    score: t.percentage,
  }));

  // Notices for students
  const studentNotices = notices.filter((n) => n.targetRoles.includes('student')).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Student Profile Hero Strip */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentStudent.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {currentStudent.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                {currentClass?.name} ({currentSection?.name || 'A'})
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Roll No: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{currentStudent.rollNo}</span> · Admission: <span className="font-mono">{currentStudent.admissionNo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/results')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>My Report Card</span>
          </button>
          <button
            onClick={() => navigate('/student/fees')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>My Fee Challans</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle="Punctual attendance records"
          icon={CheckCircle2}
          highlightColor="emerald"
        />
        <StatCard
          title="Recent Exams"
          value={publishedTests.length}
          subtitle="Released performance sheets"
          icon={Award}
          highlightColor="blue"
        />
        <StatCard
          title="Outstanding Tuition Balance"
          value={formatCurrency(totalBalance, settings.currency)}
          subtitle={totalBalance === 0 ? 'Fully paid up to date' : 'Pending bank deposit'}
          icon={CreditCard}
          highlightColor={totalBalance > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Analytics & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Performance Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Exam Scores & Percentages
            </h3>
            <button
              onClick={() => navigate('/student/results')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {publishedTests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No published test scores released yet.
              </div>
            ) : (
              publishedTests.map((t, i) => (
                <div
                  key={i}
                  className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {t.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Teacher Remark: {t.remarks || 'Keep up the good effort'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {t.obtained} / {t.total} ({t.percentage}%)
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Grade: {t.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notice Board */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Notice Board & Circulars
            </h3>
            <button
              onClick={() => navigate('/student/notices')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>All Notices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {studentNotices.map((n) => (
              <div
                key={n.id}
                className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDate(n.date)}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
