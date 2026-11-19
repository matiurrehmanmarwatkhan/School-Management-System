import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FeeRecord } from '../../types';
import {
  GraduationCap,
  UserCheck,
  Users,
  Building2,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  TrendingUp,
  FileText,
  UserPlus,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { students, teachers, parents, classes, fees, attendance, settings, notices } = useApp();
  const navigate = useNavigate();
  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null);

  // Derived Metrics
  const totalStudents = students.filter((s) => s.status === 'active').length;
  const totalTeachers = teachers.filter((t) => t.status === 'active').length;
  const totalParents = parents.length;
  const totalSections = classes.reduce((sum, c) => sum + c.sections.length, 0);

  // Today's attendance percentage
  const today = '2026-10-16';
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = todayRecords.length > 0 ? Math.round((presentCount / todayRecords.length) * 100) : 94;

  // Fees metrics (current month)
  const currentMonth = 'October 2026';
  const monthFees = fees.filter((f) => f.month === currentMonth);
  const collectedThisMonth = monthFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const outstandingFees = fees.reduce((sum, f) => sum + f.balance, 0);

  // Attendance by class chart data
  const attendanceChartData = classes.map((c) => {
    const classRecords = todayRecords.filter((a) => a.classId === c.id);
    const classPresent = classRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
    const rate = classRecords.length > 0 ? Math.round((classPresent / classRecords.length) * 100) : 92;
    return {
      name: c.name,
      percentage: rate,
      students: students.filter((s) => s.classId === c.id).length,
    };
  });

  // Monthly Fee Collection Chart Data
  const monthlyFeeData = [
    { month: 'Jun 2026', collected: 145000, target: 160000 },
    { month: 'Jul 2026', collected: 152000, target: 160000 },
    { month: 'Aug 2026', collected: 178000, target: 180000 },
    { month: 'Sep 2026', collected: 182000, target: 190000 },
    { month: 'Oct 2026', collected: collectedThisMonth || 165000, target: 195000 },
  ];

  // Recent Admissions (latest 5)
  const recentStudents = [...students].slice(0, 5);

  // Recent Fee Payments (latest 5)
  const recentPayments = [...fees]
    .filter((f) => f.paidAmount > 0)
    .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Administrative Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time enrollment, financial reconciliation, and academic telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/students')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll Student</span>
          </button>
          <button
            onClick={() => navigate('/admin/fees')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Generate Fees</span>
          </button>
        </div>
      </div>

      {/* Top Key Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle={`Across ${classes.length} classes, ${totalSections} sections`}
          icon={GraduationCap}
          highlightColor="blue"
        />
        <StatCard
          title="Active Faculty"
          value={totalTeachers}
          subtitle="Full-time instructional staff"
          icon={UserCheck}
          highlightColor="emerald"
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          subtitle={`Recorded on ${formatDate(today)}`}
          icon={CheckCircle2}
          trend={{ value: '+2.4%', isPositive: true, label: 'vs last week' }}
          highlightColor="indigo"
        />
        <StatCard
          title="Fees Collected (Oct)"
          value={formatCurrency(collectedThisMonth, settings.currency)}
          subtitle={`Outstanding: ${formatCurrency(outstandingFees, settings.currency)}`}
          icon={CreditCard}
          highlightColor="amber"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Fee Collection Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Monthly Fee Realization (PKR)
              </h3>
              <p className="text-xs text-slate-500">Collected tuition fee vs target projection</p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {settings.currency}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFeeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), settings.currency), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Rates by Class */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Class Attendance Rates
              </h3>
              <p className="text-xs text-slate-500">Today's active attendance ratio by grade</p>
            </div>
            <span className="text-xs text-slate-400">Avg 94%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Attendance']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables Row: Recent Admissions & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Student Admissions
            </h3>
            <button
              onClick={() => navigate('/admin/students')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Guardian</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentStudents.map((std) => {
                  const cls = classes.find((c) => c.id === std.classId);
                  const sec = cls?.sections.find((s) => s.id === std.sectionId);
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {std.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{std.admissionNo}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {cls?.name} ({sec?.name || 'A'})
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {std.guardianName}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge type="student" value={std.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Fee Payments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Fee Transactions
            </h3>
            <button
              onClick={() => navigate('/admin/fees')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Invoice / Student</th>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentPayments.map((fee) => {
                  const student = students.find((s) => s.id === fee.studentId);
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {student?.fullName || 'Student'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{fee.invoiceNo}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {fee.month}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(fee.paidAmount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(fee)}
                          className="px-2 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                        >
                          Print Challan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fee Receipt Modal */}
      <FeeReceiptModal
        feeRecord={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
