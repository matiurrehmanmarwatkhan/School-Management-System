import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentTransaction } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { PaymentReceiptModal } from '../../components/common/PaymentReceiptModal';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  History,
  Printer,
  Download,
  Receipt,
  CreditCard,
  Banknote,
  FileCheck,
  Calendar,
  Filter,
} from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const { payments, students, classes, fees, settings, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<PaymentTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered transactions
  const filteredPayments = useMemo(() => {
    return payments.filter((tx) => {
      const student = students.find((s) => s.id === tx.studentId);
      const matchesSearch =
        searchTerm === '' ||
        tx.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.referenceNo && tx.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.accountantName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMethod = selectedMethod === 'all' || tx.paymentMethod === selectedMethod;
      const matchesClass = selectedClassId === 'all' || tx.classId === selectedClassId;
      const matchesDate = !dateFilter || tx.paymentDate === dateFilter;

      return matchesSearch && matchesMethod && matchesClass && matchesDate;
    });
  }, [payments, students, searchTerm, selectedMethod, selectedClassId, dateFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Financial aggregates
  const totalAmount = useMemo(
    () => filteredPayments.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredPayments]
  );
  const cashAmount = useMemo(
    () =>
      filteredPayments
        .filter((tx) => tx.paymentMethod === 'Cash')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredPayments]
  );
  const bankAmount = useMemo(
    () =>
      filteredPayments
        .filter((tx) => tx.paymentMethod === 'Bank Transfer' || tx.paymentMethod === 'Online Slip')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredPayments]
  );

  const handleExport = () => {
    const data = filteredPayments.map((tx) => {
      const s = students.find((std) => std.id === tx.studentId);
      const c = classes.find((cls) => cls.id === tx.classId);
      return {
        'Receipt No': tx.receiptNo,
        'Payment Date': tx.paymentDate,
        'Student Name': s?.fullName || '',
        'Admission No': s?.admissionNo || '',
        Class: c?.name || '',
        'Amount Paid (PKR)': tx.amount,
        'Payment Method': tx.paymentMethod,
        'Reference No': tx.referenceNo || '',
        'Accountant Name': tx.accountantName,
        'Previous Balance (PKR)': tx.previousBalance,
        'New Balance (PKR)': tx.newBalance,
        Remarks: tx.remarks || '',
      };
    });
    exportToCSV(data, `payment_transactions_${Date.now()}.csv`);
    addToast('info', 'Payment transactions exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Payment Transaction History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of all fee receipts, counter collections, bank transfers, and partial installments.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Transactions</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Receipt className="w-4 h-4 text-blue-600" />
            <span>Total Collected in View</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalAmount, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {filteredPayments.length} receipts issued
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Counter Cash Payments</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(cashAmount, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Direct physical cashier counter
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Bank & Digital Slips</span>
          </div>
          <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
            {formatCurrency(bankAmount, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Online IBFT, 1-Link, and verified vouchers
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search receipt #, student name, admission #, ref # or accountant..."
          filterComponent={
            <div className="flex flex-wrap items-center gap-2">
              {/* Payment Method */}
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online Slip">Online Slip</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>

              {/* Class Filter */}
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Exact Date Filter */}
              <div className="flex items-center gap-1 text-xs">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="text-[11px] text-blue-600 hover:underline px-1"
                  >
                    Clear date
                  </button>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Method / Ref</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">New Balance</th>
                <th className="py-3 px-4">Accountant</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((tx) => {
                  const student = students.find((s) => s.id === tx.studentId);
                  const classItem = classes.find((c) => c.id === tx.classId);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {tx.receiptNo}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {formatDate(tx.paymentDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {student?.fullName || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {student?.admissionNo} (Roll: {student?.rollNo})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {classItem?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 block w-max">
                          {tx.paymentMethod}
                        </span>
                        {tx.referenceNo && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Ref: {tx.referenceNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(tx.amount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {tx.newBalance > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            {formatCurrency(tx.newBalance, settings.currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Cleared
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {tx.accountantName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTxForReceipt(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Print official receipt"
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPayments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Official Receipt Modal */}
      <PaymentReceiptModal
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />
    </div>
  );
};
