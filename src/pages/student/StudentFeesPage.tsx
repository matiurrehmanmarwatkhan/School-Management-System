import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FeeRecord } from '../../types';
import { CreditCard, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const StudentFeesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, fees, settings } = useApp();

  const currentStudent = students.find(
    (s) => s.id === currentUser?.linkedEntityId || s.email === currentUser?.email
  ) || students[0];

  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null);

  const myFees = fees
    .filter((f) => f.studentId === currentStudent.id)
    .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));

  const totalOutstanding = myFees.reduce((sum, f) => sum + f.balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Fee Challans & Dues
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View tuition vouchers, deposit confirmations, and print bank deposit challans in PKR.
        </p>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Outstanding Tuition Balance
          </span>
          <div
            className={`text-2xl font-bold mt-2 font-mono tabular-nums ${
              totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(totalOutstanding, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalOutstanding > 0 ? 'Pending bank deposit' : 'All accounts settled up to date'}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-center text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Student Deposit Guidelines
          </span>
          Print your monthly challan slip below and hand it to your guardian for deposit at any authorized bank branch or via mobile banking.
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tuition Fee Records
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4 text-right">Tuition Amount</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Print Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {fee.invoiceNo}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {fee.month}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(fee.amount, settings.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600">
                    {fee.discount > 0 ? `- ${formatCurrency(fee.discount, settings.currency)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(fee.netAmount, settings.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600">
                    {formatCurrency(fee.paidAmount, settings.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-rose-600">
                    {formatCurrency(fee.balance, settings.currency)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {formatDate(fee.dueDate)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge type="fee" value={fee.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(fee)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FeeReceiptModal feeRecord={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
