import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FeeRecord } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  CreditCard,
  Plus,
  Printer,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const FeesPage: React.FC = () => {
  const { fees, classes, students, settings, recordFeePayment, generateMonthlyFees, addCustomFeeRecord } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null);

  // Fee Generation Form
  const [genClassId, setGenClassId] = useState(classes[0]?.id || '');
  const [genMonth, setGenMonth] = useState('November 2026');
  const [genYear, setGenYear] = useState(2026);
  const [genDueDate, setGenDueDate] = useState('2026-11-10');

  // Payment Recording Form
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Online Slip'>('Cash');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Summary Metrics
  const totalInvoiced = useMemo(() => fees.reduce((sum, f) => sum + f.netAmount, 0), [fees]);
  const totalCollected = useMemo(() => fees.reduce((sum, f) => sum + f.paidAmount, 0), [fees]);
  const totalOutstanding = useMemo(() => fees.reduce((sum, f) => sum + f.balance, 0), [fees]);

  // Unique months available
  const availableMonths = useMemo(() => {
    return Array.from(new Set(fees.map((f) => f.month)));
  }, [fees]);

  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const student = students.find((s) => s.id === f.studentId);
      const matchesSearch =
        f.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassId === 'all' || f.classId === selectedClassId;
      const matchesMonth = selectedMonth === 'all' || f.month === selectedMonth;
      const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;

      return matchesSearch && matchesClass && matchesMonth && matchesStatus;
    });
  }, [fees, students, searchTerm, selectedClassId, selectedMonth, selectedStatus]);

  const totalPages = Math.ceil(filteredFees.length / pageSize);
  const paginatedFees = filteredFees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMonthlyFees(genClassId, genMonth, genYear, genDueDate);
    setIsGenerateOpen(false);
  };

  const handleOpenPayment = (fee: FeeRecord) => {
    setSelectedFeeForPayment(fee);
    setPaymentAmount(fee.balance);
    setPaymentMethod('Cash');
    setPaymentRemarks('');
    setIsRecordPaymentOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeForPayment) return;
    recordFeePayment(selectedFeeForPayment.id, paymentAmount, paymentMethod, paymentRemarks);
    setIsRecordPaymentOpen(false);
    setSelectedFeeForPayment(null);
  };

  const handleExportCSV = () => {
    const rows = filteredFees.map((f) => {
      const std = students.find((s) => s.id === f.studentId);
      const cls = classes.find((c) => c.id === f.classId);
      return {
        'Invoice #': f.invoiceNo,
        Student: std?.fullName || '',
        'Admission #': std?.admissionNo || '',
        Class: cls?.name || '',
        Month: f.month,
        'Amount (PKR)': f.amount,
        Discount: f.discount,
        'Net Amount': f.netAmount,
        'Paid (PKR)': f.paidAmount,
        'Balance (PKR)': f.balance,
        Status: f.status,
        'Due Date': f.dueDate,
        'Payment Date': f.paymentDate || '',
      };
    });
    exportToCSV('Fee_Ledgers', rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Fee & Accounts Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Billing challans, student fee ledgers, payment recording, and official receipt generation in PKR.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Monthly Challans</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
            {formatCurrency(totalInvoiced, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all issued vouchers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Collected
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono tabular-nums">
            {formatCurrency(totalCollected, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Realized bank and cash deposits</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Total Outstanding
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono tabular-nums">
            {formatCurrency(totalOutstanding, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending dues and partial balances</p>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={(v) => {
              setSearchTerm(v);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by invoice #, student name, or roll #..."
            onExport={handleExportCSV}
            filterComponent={
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Challan / Invoice</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4 text-right">Net Fee</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedFees.map((fee) => {
                const std = students.find((s) => s.id === fee.studentId);
                const cls = classes.find((c) => c.id === fee.classId);
                return (
                  <tr key={fee.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {fee.invoiceNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {std?.fullName || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {cls?.name} · Roll #{std?.rollNo}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{fee.month}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {formatCurrency(fee.netAmount, settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatCurrency(fee.paidAmount, settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
                      {formatCurrency(fee.balance, settings.currency)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatDate(fee.dueDate)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="fee" value={fee.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fee.balance > 0 && (
                          <button
                            onClick={() => handleOpenPayment(fee)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded transition-colors"
                          >
                            Pay Dues
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReceipt(fee)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredFees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Generate Monthly Challans Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Monthly Fee Challans"
        description="Batch generate billing records for all students in a class"
        maxWidth="md"
      >
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Target Class *</label>
            <select
              value={genClassId}
              onChange={(e) => setGenClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatCurrency(c.monthlyFee, settings.currency)}/month)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Billing Month & Year *</label>
            <input
              type="text"
              required
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              placeholder="e.g. November 2026"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={genDueDate}
              onChange={(e) => setGenDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-700 dark:text-blue-300">
            This will calculate monthly tuition fees according to class structure and generate vouchers for all students not yet billed for this cycle.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Generate Challans
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {selectedFeeForPayment && (
        <Modal
          isOpen={isRecordPaymentOpen}
          onClose={() => setIsRecordPaymentOpen(false)}
          title="Record Fee Payment"
          description={`Invoice: ${selectedFeeForPayment.invoiceNo}`}
          maxWidth="md"
        >
          <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {students.find((s) => s.id === selectedFeeForPayment.studentId)?.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Net Amount:</span>
                <span className="font-mono">
                  {formatCurrency(selectedFeeForPayment.netAmount, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-mono text-emerald-600">
                  {formatCurrency(selectedFeeForPayment.paidAmount, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Outstanding Balance:</span>
                <span className="font-mono text-rose-600">
                  {formatCurrency(selectedFeeForPayment.balance, settings.currency)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Deposit / Payment Amount (PKR) *
              </label>
              <input
                type="number"
                required
                max={selectedFeeForPayment.balance}
                min={1}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Enter full or partial payment amount.
              </span>
            </div>

            <div>
              <label className="block font-medium mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                <option value="Cash">Cash Deposit</option>
                <option value="Bank Transfer">Direct Bank Transfer</option>
                <option value="Cheque">Banker's Cheque / Pay Order</option>
                <option value="Online Slip">Online Challan Slip</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Cashier Remarks / Transaction Ref</label>
              <input
                type="text"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                placeholder="e.g. Paid at Habib Bank F-10 branch ref #9872"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Record Deposit
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Fee Receipt Printable Modal */}
      <FeeReceiptModal
        feeRecord={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
