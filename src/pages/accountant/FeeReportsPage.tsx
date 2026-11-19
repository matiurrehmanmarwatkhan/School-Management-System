import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  Building2,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Banknote,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const FeeReportsPage: React.FC = () => {
  const { fees, payments, classes, students, settings, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'classwise' | 'daterange'>('daily');

  // Daily Report State
  const [dailyDate, setDailyDate] = useState<string>('2026-10-05');

  // Date Range State
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-16');

  // 1. Daily Report Calculations
  const dailyTransactions = useMemo(() => {
    return payments.filter((p) => p.paymentDate === dailyDate);
  }, [payments, dailyDate]);

  const dailyTotal = useMemo(
    () => dailyTransactions.reduce((sum, p) => sum + p.amount, 0),
    [dailyTransactions]
  );
  const dailyCash = useMemo(
    () =>
      dailyTransactions
        .filter((p) => p.paymentMethod === 'Cash')
        .reduce((sum, p) => sum + p.amount, 0),
    [dailyTransactions]
  );
  const dailyBank = useMemo(
    () =>
      dailyTransactions
        .filter((p) => p.paymentMethod === 'Bank Transfer' || p.paymentMethod === 'Online Slip')
        .reduce((sum, p) => sum + p.amount, 0),
    [dailyTransactions]
  );

  // 2. Class-wise Breakdown Calculations
  const classWiseData = useMemo(() => {
    return classes.map((cls) => {
      const clsFees = fees.filter((f) => f.classId === cls.id);
      const totalBilled = clsFees.reduce((sum, f) => sum + f.netAmount, 0);
      const totalCollected = clsFees.reduce((sum, f) => sum + f.paidAmount, 0);
      const totalOutstanding = clsFees.reduce((sum, f) => sum + f.balance, 0);
      const recoveryRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
      const studentCount = students.filter((s) => s.classId === cls.id && s.status === 'active').length;

      return {
        id: cls.id,
        name: cls.name,
        studentCount,
        monthlyFee: cls.monthlyFee,
        totalBilled,
        totalCollected,
        totalOutstanding,
        recoveryRate,
      };
    });
  }, [classes, fees, students]);

  // 3. Date-Range Calculations
  const rangeTransactions = useMemo(() => {
    return payments.filter((p) => p.paymentDate >= startDate && p.paymentDate <= endDate);
  }, [payments, startDate, endDate]);

  const rangeTotal = useMemo(
    () => rangeTransactions.reduce((sum, p) => sum + p.amount, 0),
    [rangeTransactions]
  );

  // 4. Monthly Trend Data
  const monthlyTrend = [
    { month: 'Jun 2026', billed: 420000, collected: 405000, recovery: 96 },
    { month: 'Jul 2026', billed: 390000, collected: 378000, recovery: 97 },
    { month: 'Aug 2026', billed: 450000, collected: 432000, recovery: 96 },
    { month: 'Sep 2026', billed: 460000, collected: 442000, recovery: 96 },
    { month: 'Oct 2026', billed: 475000, collected: 368000, recovery: 77 },
  ];

  // Status Distribution
  const statusPieData = useMemo(() => {
    const paid = fees.filter((f) => f.status === 'paid').length;
    const partial = fees.filter((f) => f.status === 'partial').length;
    const unpaid = fees.filter((f) => f.status === 'unpaid').length;
    const overdue = fees.filter((f) => f.status === 'overdue').length;

    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Partially Paid', value: partial, color: '#f59e0b' },
      { name: 'Unpaid', value: unpaid, color: '#94a3b8' },
      { name: 'Overdue', value: overdue, color: '#f43f5e' },
    ];
  }, [fees]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDaily = () => {
    const data = dailyTransactions.map((tx) => {
      const s = students.find((std) => std.id === tx.studentId);
      const c = classes.find((cls) => cls.id === tx.classId);
      return {
        'Receipt No': tx.receiptNo,
        Date: tx.paymentDate,
        'Student Name': s?.fullName || '',
        'Admission No': s?.admissionNo || '',
        Class: c?.name || '',
        'Amount Paid (PKR)': tx.amount,
        'Payment Method': tx.paymentMethod,
        'Reference No': tx.referenceNo || '',
        Accountant: tx.accountantName,
      };
    });
    exportToCSV(data, `daily_collection_${dailyDate}.csv`);
    addToast('info', `Exported daily collection report for ${dailyDate}`);
  };

  const handleExportClassWise = () => {
    const data = classWiseData.map((cw) => ({
      Class: cw.name,
      'Active Students': cw.studentCount,
      'Monthly Tuition Fee (PKR)': cw.monthlyFee,
      'Total Billed (PKR)': cw.totalBilled,
      'Total Collected (PKR)': cw.totalCollected,
      'Outstanding Balance (PKR)': cw.totalOutstanding,
      'Recovery Rate (%)': `${cw.recoveryRate}%`,
    }));
    exportToCSV(data, `classwise_fee_report_${Date.now()}.csv`);
    addToast('info', 'Class-wise fee report exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Fee Collection & Recovery Reports
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded">
              Audited PKR Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional revenue summaries, daily cashier books, recovery rates, and date-range reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Current Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block p-4 border-b border-slate-300 mb-4 text-center">
        <h2 className="text-xl font-bold uppercase">{settings.name}</h2>
        <p className="text-xs text-slate-600">{settings.address} · Phone: {settings.phone}</p>
        <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-800">
          Financial Accounts & Revenue Collection Report
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Print generated on: {formatDate(new Date().toISOString().split('T')[0])} · System Currency: Pakistani Rupee (PKR)
        </p>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs no-print">
        {[
          { id: 'daily', label: 'Daily Collection Book', icon: Calendar },
          { id: 'classwise', label: 'Class-Wise Recovery', icon: Building2 },
          { id: 'monthly', label: 'Monthly Trends & Distribution', icon: TrendingUp },
          { id: 'daterange', label: 'Date-Range Ledger', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY COLLECTION REPORT */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Daily Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Select Collection Date:
              </label>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
            <button
              onClick={handleExportDaily}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Daily CSV</span>
            </button>
          </div>

          {/* Daily KPI summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Total Received ({formatDate(dailyDate)})</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(dailyTotal, settings.currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {dailyTransactions.length} receipts processed
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Cash Received at Counter</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(dailyCash, settings.currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Physical drawer currency</div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Bank & 1-Link Digital Slips</span>
              </div>
              <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                {formatCurrency(dailyBank, settings.currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Electronic settlement</div>
            </div>
          </div>

          {/* Daily Transactions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Daily Cashier Log · {formatDate(dailyDate)}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Method & Reference</th>
                    <th className="py-3 px-4 text-right">Amount (PKR)</th>
                    <th className="py-3 px-4">Cashier</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dailyTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No transactions recorded on {formatDate(dailyDate)}. Try picking October 5, 2026.
                      </td>
                    </tr>
                  ) : (
                    dailyTransactions.map((tx) => {
                      const student = students.find((s) => s.id === tx.studentId);
                      const classItem = classes.find((c) => c.id === tx.classId);

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {tx.receiptNo}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {student?.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {student?.admissionNo}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {classItem?.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {tx.paymentMethod}
                            </span>
                            {tx.referenceNo && (
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                {tx.referenceNo}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatCurrency(tx.amount, settings.currency)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {tx.accountantName}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {tx.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS-WISE RECOVERY REPORT */}
      {activeTab === 'classwise' && (
        <div className="space-y-4">
          <div className="flex justify-end no-print">
            <button
              onClick={handleExportClassWise}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Class-Wise CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-center">Active Enrolled</th>
                    <th className="py-3 px-4 text-right">Fee / Month</th>
                    <th className="py-3 px-4 text-right">Total Net Billed</th>
                    <th className="py-3 px-4 text-right">Total Collected</th>
                    <th className="py-3 px-4 text-right">Outstanding Due</th>
                    <th className="py-3 px-4 text-center">Recovery %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classWiseData.map((cw) => (
                    <tr key={cw.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {cw.name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {cw.studentCount} students
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {formatCurrency(cw.monthlyFee, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(cw.totalBilled, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cw.totalCollected, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(cw.totalOutstanding, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            cw.recoveryRate >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {cw.recoveryRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY TRENDS & STATUS PIE */}
      {activeTab === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Monthly Institutional Collection vs Target
            </h3>
            <p className="text-xs text-slate-500 mb-4">Historical PKR receipts across academic months</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="billed" fill="#94a3b8" name="Total Invoiced" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" fill="#3b82f6" name="Total Collected" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Fee Record Status Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-3">Portfolio ratio of all generated challans</p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={35}
                      paddingAngle={3}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs mt-2">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.value} ({Math.round((item.value / (fees.length || 1)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATE-RANGE LEDGER */}
      {activeTab === 'daterange' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="text-xs font-mono">
              <span className="text-slate-400">Range Total: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(rangeTotal, settings.currency)}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount (PKR)</th>
                    <th className="py-3 px-4">Accountant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rangeTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No transactions found in this date range.
                      </td>
                    </tr>
                  ) : (
                    rangeTransactions.map((tx) => {
                      const student = students.find((s) => s.id === tx.studentId);
                      const classItem = classes.find((c) => c.id === tx.classId);

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {tx.receiptNo}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {formatDate(tx.paymentDate)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {student?.fullName}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {classItem?.name}
                          </td>
                          <td className="py-3 px-4">{tx.paymentMethod}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatCurrency(tx.amount, settings.currency)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {tx.accountantName}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
