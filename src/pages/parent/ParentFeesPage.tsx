import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FeeRecord } from '../../types';
import { CreditCard, Printer, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ParentFeesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { parents, students, classes, fees, settings } = useApp();

  const currentParent = parents.find(
    (p) => p.id === currentUser?.linkedEntityId || p.email === currentUser?.email
  ) || parents[0];

  const linkedStudents = students.filter((s) => currentParent.linkedStudentIds.includes(s.id));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');
  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null);

  const activeStudent = linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];
  const activeClass = classes.find((c) => c.id === activeStudent?.classId);

  const studentFees = fees
    .filter((f) => f.studentId === activeStudent?.id)
    .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));

  const totalOutstanding = studentFees.reduce((sum, f) => sum + f.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Fee Vouchers & Payment Ledgers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View monthly tuition fees, verified payment history, and print official challan receipts in PKR.
          </p>
        </div>

        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            {linkedStudents.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedStudentId(child.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeStudent?.id === child.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {child.firstName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Payment Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Fee Deposit Instructions:</span>
          School fee challans are payable at any designated Habib Bank Limited (HBL) or Meezan Bank branch across Pakistan using the printable voucher below, or via online bank transfer using the 1-Link invoice number. Real payment gateways are intentionally simulated in this frontend demo.
        </div>
      </div>

      {/* Balance Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Standard Monthly Tuition
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
            {formatCurrency(activeClass?.monthlyFee || 8500, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{activeClass?.name} tuition rate</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Total Outstanding Balance
          </span>
          <div
            className={`text-2xl font-bold mt-2 font-mono tabular-nums ${
              totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(totalOutstanding, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalOutstanding > 0 ? 'Due for settlement' : 'No overdue liabilities'}
          </p>
        </div>
      </div>

      {/* Invoices & Receipts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Billing Invoices for {activeStudent?.fullName}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Challan / Invoice #</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4 text-right">Fee (PKR)</th>
                <th className="py-3 px-4 text-right">Concession</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Official Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {fee.invoiceNo}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
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
                      <span>Print Challan</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Receipt Modal */}
      <FeeReceiptModal feeRecord={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
