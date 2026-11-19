import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FeeRecord } from '../../types';
import {
  GraduationCap,
  CheckCircle2,
  CreditCard,
  Award,
  Bell,
  ChevronRight,
  Printer,
  Calendar,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { parents, students, classes, attendance, fees, tests, notices, settings } = useApp();
  const navigate = useNavigate();

  // Find linked parent
  const currentParent = parents.find(
    (p) => p.id === currentUser?.linkedEntityId || p.email === currentUser?.email
  ) || parents[0]; // Default to Muhammad Imran (parent of Bilal & Ayesha)

  const linkedStudents = students.filter((s) => currentParent.linkedStudentIds.includes(s.id));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');
  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null);

  const activeStudent = linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];
  const activeClass = classes.find((c) => c.id === activeStudent?.classId);
  const activeSection = activeClass?.sections.find((sec) => sec.id === activeStudent?.sectionId);

  // Student Attendance Summary
  const studentAttendance = attendance.filter((a) => a.studentId === activeStudent?.id);
  const presentCount = studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round((presentCount / studentAttendance.length) * 100)
    : 95;

  // Student Fees Summary
  const studentFees = fees.filter((f) => f.studentId === activeStudent?.id);
  const totalDue = studentFees.reduce((sum, f) => sum + f.balance, 0);
  const currentMonthFee = studentFees.find((f) => f.month === 'October 2026');

  // Student Published Test Results (DRAFTS STRICTLY EXCLUDED)
  const studentResults = tests
    .filter((t) => t.status === 'published' && t.marks.some((m) => m.studentId === activeStudent?.id))
    .map((t) => ({
      test: t,
      mark: t.marks.find((m) => m.studentId === activeStudent?.id)!,
    }))
    .slice(0, 4);

  // School announcements
  const parentNotices = notices.filter((n) => n.targetRoles.includes('parent')).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Parent Portal — {currentParent.fullName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring academic progress, fee challans, and attendance for your linked wards.
          </p>
        </div>

        {/* Multi-child Switcher */}
        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Child:</span>
            {linkedStudents.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedStudentId(child.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeStudent?.id === child.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {child.firstName} ({classes.find((c) => c.id === child.classId)?.name})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Child Summary Overview Strip */}
      {activeStudent && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
              {activeStudent.firstName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {activeStudent.fullName}
              </div>
              <div className="text-[11px] text-slate-500">
                Admission No: <span className="font-mono font-medium">{activeStudent.admissionNo}</span> · Roll #{activeStudent.rollNo}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400 block text-[10px]">Class & Section</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {activeClass?.name} - Section {activeSection?.name || 'A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Date of Birth</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {formatDate(activeStudent.dob)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Enrollment Status</span>
              <StatusBadge type="student" value={activeStudent.status} />
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle="Based on current academic session"
          icon={CheckCircle2}
          highlightColor="emerald"
        />
        <StatCard
          title="Current Month Fee"
          value={currentMonthFee ? formatCurrency(currentMonthFee.netAmount, settings.currency) : 'N/A'}
          subtitle={`Status: ${currentMonthFee?.status.toUpperCase() || 'Paid'}`}
          icon={CreditCard}
          highlightColor="blue"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(totalDue, settings.currency)}
          subtitle={totalDue === 0 ? 'All dues fully reconciled' : 'Payment pending'}
          icon={CreditCard}
          highlightColor={totalDue > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Grid: Published Test Results & School Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Published Test Results */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Latest Published Test Results
              </h3>
              <p className="text-[11px] text-slate-400">Official verified assessment scores</p>
            </div>
            <button
              onClick={() => navigate('/parent/results')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {studentResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No published results available at this time. Draft assessments are under grading.
              </div>
            ) : (
              studentResults.map(({ test, mark }) => (
                <div
                  key={test.id}
                  className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {test.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Conducted: {formatDate(test.date)} · Remarks: {mark.remarks || 'Satisfactory'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {mark.marksObtained} / {test.totalMarks} ({mark.percentage}%)
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Grade: {mark.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices & Circulars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              School Circulars & Notices
            </h3>
            <button
              onClick={() => navigate('/parent/notices')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>Notice Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {parentNotices.map((n) => (
              <div
                key={n.id}
                className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {n.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{formatDate(n.date)}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Receipt Modal */}
      <FeeReceiptModal feeRecord={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
