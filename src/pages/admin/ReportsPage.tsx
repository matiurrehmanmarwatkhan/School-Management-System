import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  CreditCard,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { students, teachers, classes, fees, attendance, tests, settings } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'enrollment' | 'attendance' | 'fees' | 'academic'>('fees');
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Attendance metrics
  const attendanceReportData = useMemo(() => {
    return classes.map((c) => {
      const classStudents = students.filter((s) => s.classId === c.id);
      const classAttendance = attendance.filter((a) => a.classId === c.id);
      const present = classAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
      const rate = classAttendance.length > 0 ? Math.round((present / classAttendance.length) * 100) : 95;
      return {
        className: c.name,
        studentsCount: classStudents.length,
        attendanceRate: rate,
      };
    });
  }, [classes, students, attendance]);

  // Fee collection report data
  const feeReportData = useMemo(() => {
    return classes.map((c) => {
      const classFees = fees.filter((f) => f.classId === c.id);
      const totalInvoiced = classFees.reduce((s, f) => s + f.netAmount, 0);
      const totalCollected = classFees.reduce((s, f) => s + f.paidAmount, 0);
      const outstanding = classFees.reduce((s, f) => s + f.balance, 0);
      return {
        className: c.name,
        totalInvoiced,
        totalCollected,
        outstanding,
      };
    });
  }, [classes, fees]);

  // Academic assessment performance
  const academicReportData = useMemo(() => {
    const publishedTests = tests.filter((t) => t.status === 'published');
    return publishedTests.map((t) => {
      const cls = classes.find((c) => c.id === t.classId);
      const avgPercentage = t.marks.length > 0
        ? Math.round(t.marks.reduce((sum, m) => sum + m.percentage, 0) / t.marks.length)
        : 0;
      return {
        testTitle: t.title,
        className: cls?.name || 'Class',
        date: t.date,
        totalStudents: t.marks.length,
        averageScore: avgPercentage,
      };
    });
  }, [tests, classes]);

  const handleExportReportCSV = () => {
    if (activeReportTab === 'fees') {
      exportToCSV('Fee_Collection_Report', feeReportData);
    } else if (activeReportTab === 'attendance') {
      exportToCSV('Attendance_Analytics_Report', attendanceReportData);
    } else if (activeReportTab === 'academic') {
      exportToCSV('Academic_Performance_Report', academicReportData);
    } else {
      const enrollmentData = classes.map((c) => ({
        Class: c.name,
        'Enrolled Students': students.filter((s) => s.classId === c.id).length,
        Sections: c.sections.length,
        'Tuition (PKR)': c.monthlyFee,
      }));
      exportToCSV('Enrollment_Demographics', enrollmentData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export official summaries of enrollment demographics, fee reconciliation, and academic results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportReportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Report Category Navigation */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl no-print">
        {(
          [
            { id: 'fees', label: 'Fee Collection Ledger', icon: CreditCard },
            { id: 'attendance', label: 'Attendance Rates', icon: CheckCircle2 },
            { id: 'academic', label: 'Academic Performance', icon: Award },
            { id: 'enrollment', label: 'Student Demographics', icon: Users },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeReportTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Header for Print */}
      <div className="print-only text-center pb-4 border-b border-slate-200 mb-6">
        <h2 className="text-xl font-bold uppercase">{settings.name}</h2>
        <p className="text-xs">{settings.address}</p>
        <p className="text-xs font-semibold mt-1">OFFICIAL INSTITUTIONAL REPORT - {activeReportTab.toUpperCase()}</p>
      </div>

      {/* Tab: Fee Collection Ledger */}
      {activeReportTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs no-print">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Fee Realization by Class (PKR)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeReportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v), settings.currency)} />
                  <Bar dataKey="totalCollected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outstanding" fill="#f43f5e" name="Outstanding" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Total Invoiced (PKR)</th>
                  <th className="py-3 px-4 text-right">Total Collected (PKR)</th>
                  <th className="py-3 px-4 text-right">Outstanding (PKR)</th>
                  <th className="py-3 px-4 text-right">Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feeReportData.map((row) => {
                  const rate = row.totalInvoiced > 0 ? Math.round((row.totalCollected / row.totalInvoiced) * 100) : 0;
                  return (
                    <tr key={row.className}>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {row.className}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {formatCurrency(row.totalInvoiced, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-semibold">
                        {formatCurrency(row.totalCollected, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-600 font-semibold">
                        {formatCurrency(row.outstanding, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Attendance Rates */}
      {activeReportTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-right">Enrolled Students</th>
                <th className="py-3 px-4 text-right">Average Attendance Rate</th>
                <th className="py-3 px-4">Performance Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendanceReportData.map((r) => (
                <tr key={r.className}>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {r.className}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {r.studentsCount} Students
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                    {r.attendanceRate}%
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.attendanceRate >= 90
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.attendanceRate >= 90 ? 'Excellent Regularity' : 'Needs Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Academic Performance */}
      {activeReportTab === 'academic' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Assessment Title</th>
                <th className="py-3 px-4">Target Class</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Candidates Tested</th>
                <th className="py-3 px-4 text-right">Batch Average Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {academicReportData.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {row.testTitle}
                  </td>
                  <td className="py-3 px-4">{row.className}</td>
                  <td className="py-3 px-4 font-mono">{formatDate(row.date)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{row.totalStudents}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                    {row.averageScore}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Demographics */}
      {activeReportTab === 'enrollment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-right">Total Sections</th>
                <th className="py-3 px-4 text-right">Active Students</th>
                <th className="py-3 px-4 text-right">Monthly Fee Rate (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classes.map((c) => {
                const count = students.filter((s) => s.classId === c.id).length;
                return (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{c.sections.length}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">{count}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatCurrency(c.monthlyFee, settings.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
