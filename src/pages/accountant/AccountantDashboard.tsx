import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PaymentReceiptModal } from '../../components/common/PaymentReceiptModal';
import { PaymentTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  Printer,
  History,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap,
  ArrowUpRight,
  ShieldAlert,
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
} from 'recharts';

export const AccountantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { fees, payments, students, classes, settings } = useApp();
  const { currentUser } = useAuth();
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<PaymentTransaction | null>(null);

  // Financial aggregates
  const currentMonthName = 'October 2026';
  const currentMonthFees = fees.filter((f) => f.month === currentMonthName);

  // Total collected this month: sum of all payments with paymentDate in October 2026
  const thisMonthPayments = payments.filter((p) => p.paymentDate.startsWith('2026-10'));
  const totalCollectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Total outstanding across all active fee records
  const totalOutstanding = fees.reduce((sum, f) => sum + f.balance, 0);

  // Record counts
  const totalPaidRecords = fees.filter((f) => f.status === 'paid').length;
  const totalUnpaidRecords = fees.filter((f) => f.status === 'unpaid').length;
  const totalPartialRecords = fees.filter((f) => f.status === 'partial').length;
  const totalOverdueRecords = fees.filter((f) => f.status === 'overdue').length;

  // Monthly collection comparison chart data
  const monthlyData = [
    { month: 'Jun 2026', billed: 420000, collected: 405000, outstanding: 15000 },
    { month: 'Jul 2026', billed: 390000, collected: 378000, outstanding: 12000 },
    { month: 'Aug 2026', billed: 450000, collected: 432000, outstanding: 18000 },
    { month: 'Sep 2026', billed: 460000, collected: 442000, outstanding: 18000 },
    { month: 'Oct 2026', billed: 475000, collected: 368000, outstanding: 107000 },
  ];

  // Recent payment transactions
  const recentPayments = payments.slice(0, 6);

  // High priority overdue defaulters
  const overdueDefaulters = fees
    .filter((f) => f.status === 'overdue' && f.balance > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header & Accountant Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Accountant Finance Dashboard
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded">
              PKR Accounts Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.name || 'Muhammad Arif'}</span> · School Accounts & Fee Management Division
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/accountant/record-payment')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => navigate('/accountant/outstanding')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Outstanding ({totalOverdueRecords + totalPartialRecords})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Collected This Month"
          value={formatCurrency(totalCollectedThisMonth, settings.currency)}
          subtitle={`${thisMonthPayments.length} transactions processed in Oct`}
          icon={CreditCard}
          trend={{ value: '+14.2%', isPositive: true, label: 'vs last month' }}
        />
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(totalOutstanding, settings.currency)}
          subtitle="Unpaid, partial & overdue balance"
          icon={AlertCircle}
          trend={{ value: `${totalOverdueRecords} overdue`, isPositive: false, label: 'urgent follow-up' }}
        />
        <StatCard
          title="Paid Challans"
          value={totalPaidRecords}
          subtitle={`Across ${fees.length} generated challans`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending / Defaulters"
          value={totalUnpaidRecords + totalPartialRecords + totalOverdueRecords}
          subtitle={`${totalOverdueRecords} overdue · ${totalPartialRecords} partial`}
          icon={Clock}
        />
      </div>

      {/* Status Breakdown Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Fee Records Portfolio Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">Total generated challans: {fees.length}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Paid: {totalPaidRecords} ({Math.round((totalPaidRecords / (fees.length || 1)) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Partially Paid: {totalPartialRecords}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Unpaid: {totalUnpaidRecords}
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Overdue: {totalOverdueRecords}
            </span>
          </div>
        </div>

        {/* Visual Progress Stack */}
        <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
          <div
            style={{ width: `${(totalPaidRecords / (fees.length || 1)) * 100}%` }}
            className="bg-emerald-500 transition-all"
            title={`Paid: ${totalPaidRecords}`}
          />
          <div
            style={{ width: `${(totalPartialRecords / (fees.length || 1)) * 100}%` }}
            className="bg-amber-500 transition-all"
            title={`Partial: ${totalPartialRecords}`}
          />
          <div
            style={{ width: `${(totalUnpaidRecords / (fees.length || 1)) * 100}%` }}
            className="bg-slate-300 dark:bg-slate-600 transition-all"
            title={`Unpaid: ${totalUnpaidRecords}`}
          />
          <div
            style={{ width: `${(totalOverdueRecords / (fees.length || 1)) * 100}%` }}
            className="bg-rose-500 transition-all"
            title={`Overdue: ${totalOverdueRecords}`}
          />
        </div>
      </div>

      {/* Charts & Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Monthly Fee Collection vs Billed (PKR)</span>
              </h3>
              <p className="text-xs text-slate-500">Historical performance across 2026 academic periods</p>
            </div>
            <button
              onClick={() => navigate('/accountant/reports')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="collected" fill="#10b981" name="Fee Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#f43f5e" name="Remaining Due" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operational Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Accountant Action Hub
            </h3>
            <p className="text-xs text-slate-500 mb-4">Direct workflow shortcuts for daily counter duties</p>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/accountant/record-payment')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-600 text-white">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Record Fee Payment</div>
                    <div className="text-[10px] opacity-80">Counter cash, bank slip, or online</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/accountant/fees')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fee Overview Ledger</div>
                    <div className="text-[10px] text-slate-400">All student invoices & balances</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/accountant/payments')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Payment Transactions</div>
                    <div className="text-[10px] text-slate-400">History, receipts & audits</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/accountant/students')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Student Fee Ledgers</div>
                    <div className="text-[10px] text-slate-400">Lookup by admission or name</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Currency: <strong>Pakistani Rupee (PKR)</strong></span>
            <span>Fee cycle: Monthly</span>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Recent Payments & High Priority Defaulters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payment Transactions (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Recent Fee Payments
              </h3>
              <p className="text-xs text-slate-500">Live payment activity recorded in school accounts</p>
            </div>
            <button
              onClick={() => navigate('/accountant/payments')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View All ({payments.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No payments recorded yet. Click "Record Payment" to process fees.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((tx) => {
                    const student = students.find((s) => s.id === tx.studentId);
                    const classItem = classes.find((c) => c.id === tx.classId);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                            {tx.receiptNo}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {formatDate(tx.paymentDate)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {student?.fullName || 'Student'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {student?.admissionNo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {classItem?.name || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatCurrency(tx.amount, settings.currency)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedTxForReceipt(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Print / View Official Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue Watchlist (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Overdue Defaulters
                </h3>
              </div>
              <button
                onClick={() => navigate('/accountant/outstanding')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {overdueDefaulters.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No overdue fee records currently recorded!
                </div>
              ) : (
                overdueDefaulters.map((fee) => {
                  const student = students.find((s) => s.id === fee.studentId);
                  const classItem = classes.find((c) => c.id === fee.classId);

                  return (
                    <div key={fee.id} className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {student?.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {classItem?.name} · {student?.admissionNo}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Guardian: {student?.guardianPhone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(fee.balance, settings.currency)}
                          </div>
                          <StatusBadge type="fee" status={fee.status} />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => navigate(`/accountant/record-payment?feeId=${fee.id}&studentId=${fee.studentId}`)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                        >
                          Collect Now →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => navigate('/accountant/outstanding')}
              className="w-full py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
            >
              Print Outstanding Notice Slips
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <PaymentReceiptModal
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />
    </div>
  );
};
