import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FeeRecord, FeeStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  CreditCard,
  Plus,
  Printer,
  Download,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const FeeOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { fees, students, classes, settings, sessions, generateMonthlyFees, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genClassId, setGenClassId] = useState<string>(classes[0]?.id || '');
  const [genMonth, setGenMonth] = useState('November 2026');
  const [genYear, setGenYear] = useState(2026);
  const [genDueDate, setGenDueDate] = useState('2026-11-10');
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<FeeRecord | null>(null);

  // Unique billing months from records
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    fees.forEach((f) => set.add(f.month));
    return Array.from(set);
  }, [fees]);

  // Filtered fee records
  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const student = students.find((s) => s.id === f.studentId);
      const matchesSearch =
        searchTerm === '' ||
        student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassId === 'all' || f.classId === selectedClassId;
      const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
      const matchesMonth = selectedMonth === 'all' || f.month === selectedMonth;

      return matchesSearch && matchesClass && matchesStatus && matchesMonth;
    });
  }, [fees, students, searchTerm, selectedClassId, selectedStatus, selectedMonth]);

  const totalPages = Math.ceil(filteredFees.length / pageSize) || 1;
  const paginatedFees = filteredFees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Financial summary of filtered dataset
  const summary = useMemo(() => {
    let totalNet = 0;
    let totalPaid = 0;
    let totalBal = 0;
    filteredFees.forEach((f) => {
      totalNet += f.netAmount;
      totalPaid += f.paidAmount;
      totalBal += f.balance;
    });
    return { totalNet, totalPaid, totalBal };
  }, [filteredFees]);

  const handleExport = () => {
    const data = filteredFees.map((f) => {
      const s = students.find((std) => std.id === f.studentId);
      const c = classes.find((cls) => cls.id === f.classId);
      return {
        'Invoice No': f.invoiceNo,
        'Admission No': s?.admissionNo || '',
        'Student Name': s?.fullName || '',
        Class: c?.name || '',
        Month: f.month,
        'Gross Fee (PKR)': f.amount,
        'Discount (PKR)': f.discount,
        'Net Payable (PKR)': f.netAmount,
        'Paid Amount (PKR)': f.paidAmount,
        'Balance (PKR)': f.balance,
        Status: f.status.toUpperCase(),
        'Due Date': f.dueDate,
        'Payment Date': f.paymentDate || '',
        'Payment Method': f.paymentMethod || '',
      };
    });
    exportToCSV(data, `fee_records_${selectedMonth}_${Date.now()}.csv`);
    addToast('info', 'Fee records exported to CSV');
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genClassId) {
      addToast('error', 'Please select a class');
      return;
    }
    const createdCount = generateMonthlyFees(genClassId, genMonth, genYear, genDueDate);
    setIsGenerateModalOpen(false);
    if (createdCount > 0) {
      addToast('success', `Generated ${createdCount} new challans for ${genMonth}`);
    } else {
      addToast('info', `No new challans generated. Invoices already exist for ${genMonth}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Fee Management & Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete institutional fee register, student challans, discounts, and outstanding balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Generate Monthly Challans</span>
          </button>
          <button
            onClick={() => navigate('/accountant/record-payment')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Filtered Records</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
            {filteredFees.length} / {fees.length}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Net Billed</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {formatCurrency(summary.totalNet, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Collected</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {formatCurrency(summary.totalPaid, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Balance Due</span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {formatCurrency(summary.totalBal, settings.currency)}
          </span>
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
          searchPlaceholder="Search student name, admission number, or invoice #..."
          onExport={handleExport}
          exportLabel="Export CSV"
          filterComponent={
            <div className="flex flex-wrap items-center gap-2">
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

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>

              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* Quick Tabs for Status */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto text-xs">
          <span className="text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Quick:</span>
          </span>
          {[
            { id: 'all', label: `All (${fees.length})` },
            { id: 'paid', label: `Paid (${fees.filter((f) => f.status === 'paid').length})` },
            { id: 'partial', label: `Partial (${fees.filter((f) => f.status === 'partial').length})` },
            { id: 'unpaid', label: `Unpaid (${fees.filter((f) => f.status === 'unpaid').length})` },
            { id: 'overdue', label: `Overdue (${fees.filter((f) => f.status === 'overdue').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Fee Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice / Month</th>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-right">Total Fee</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedFees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No fee records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedFees.map((fee) => {
                  const student = students.find((s) => s.id === fee.studentId);
                  const classItem = classes.find((c) => c.id === fee.classId);

                  return (
                    <tr
                      key={fee.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100 block">
                          {fee.invoiceNo}
                        </span>
                        <span className="text-[10px] text-slate-400">{fee.month}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/accountant/students?studentId=${student?.id}`)}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 block text-left"
                        >
                          {student?.fullName || 'N/A'}
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">
                          {student?.admissionNo} (Roll #{student?.rollNo})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {classItem?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {formatCurrency(fee.amount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {fee.discount > 0 ? `-${formatCurrency(fee.discount, settings.currency)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(fee.paidAmount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            fee.balance > 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-400'
                          }
                        >
                          {formatCurrency(fee.balance, settings.currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge type="fee" status={fee.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {fee.balance > 0 ? (
                            <button
                              onClick={() =>
                                navigate(
                                  `/accountant/record-payment?feeId=${fee.id}&studentId=${fee.studentId}`
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
                              title="Record payment for this challan"
                            >
                              Pay
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded">
                              Cleared
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedFeeForReceipt(fee)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Print / View Challan Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
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
            totalItems={filteredFees.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Generate Monthly Challans Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Fee Challans"
        description="Batch generate billing invoices in PKR for students of a specific class."
        maxWidth="md"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Target Class</label>
            <select
              required
              value={genClassId}
              onChange={(e) => setGenClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (PKR {c.monthlyFee.toLocaleString()}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Billing Month</label>
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
              <label className="block font-medium mb-1">Year</label>
              <input
                type="number"
                required
                value={genYear}
                onChange={(e) => setGenYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Payment Due Date</label>
            <input
              type="date"
              required
              value={genDueDate}
              onChange={(e) => setGenDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-[11px]">
            Invoices will only be generated for active students who do not yet have an invoice for {genMonth}. Existing invoices are protected.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
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

      {/* Fee Receipt Challan Modal */}
      <FeeReceiptModal
        feeRecord={selectedFeeForReceipt}
        onClose={() => setSelectedFeeForReceipt(null)}
      />
    </div>
  );
};
