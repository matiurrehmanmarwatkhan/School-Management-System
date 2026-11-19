import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FeeRecord, PaymentTransaction, Student } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PaymentReceiptModal } from '../../components/common/PaymentReceiptModal';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  GraduationCap,
  Search,
  Receipt,
  Printer,
  History,
  Phone,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const StudentFeeLedgersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { students, classes, fees, payments, settings } = useApp();

  const paramStudentId = searchParams.get('studentId');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    paramStudentId || students[0]?.id || ''
  );

  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<PaymentTransaction | null>(null);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<FeeRecord | null>(null);

  useEffect(() => {
    if (paramStudentId) {
      setSelectedStudentId(paramStudentId);
    }
  }, [paramStudentId]);

  // Filter students for picker
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.guardianPhone.includes(q)
    );
  }, [students, searchTerm]);

  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const studentClass = useMemo(() => {
    return classes.find((c) => c.id === currentStudent?.classId);
  }, [classes, currentStudent]);

  const studentSection = useMemo(() => {
    return studentClass?.sections.find((sec) => sec.id === currentStudent?.sectionId);
  }, [studentClass, currentStudent]);

  // Invoices for this student
  const studentFees = useMemo(() => {
    if (!currentStudent) return [];
    return fees.filter((f) => f.studentId === currentStudent.id);
  }, [fees, currentStudent]);

  // Payments for this student
  const studentPayments = useMemo(() => {
    if (!currentStudent) return [];
    return payments.filter((p) => p.studentId === currentStudent.id);
  }, [payments, currentStudent]);

  // Financial Summary for student
  const lifetimeBilled = useMemo(
    () => studentFees.reduce((sum, f) => sum + f.netAmount, 0),
    [studentFees]
  );
  const lifetimePaid = useMemo(
    () => studentFees.reduce((sum, f) => sum + f.paidAmount, 0),
    [studentFees]
  );
  const lifetimeOutstanding = useMemo(
    () => studentFees.reduce((sum, f) => sum + f.balance, 0),
    [studentFees]
  );
  const lifetimeDiscount = useMemo(
    () => studentFees.reduce((sum, f) => sum + f.discount, 0),
    [studentFees]
  );

  const handlePrintLedger = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Student Fee Profile & Lifetime Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual student financial cards, chronological challan history, and past collection receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentStudent && lifetimeOutstanding > 0 && (
            <button
              onClick={() => navigate(`/accountant/record-payment?studentId=${currentStudent.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
          <button
            onClick={handlePrintLedger}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Student Fee Card</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="hidden print:block p-4 border-b border-slate-300 mb-4 text-center">
        <h2 className="text-xl font-bold uppercase">{settings.name}</h2>
        <p className="text-xs text-slate-600">{settings.address} · Phone: {settings.phone}</p>
        <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-800">
          Official Student Fee Card & Financial Ledger
        </div>
      </div>

      {/* Main Two-Column Layout: Student Picker (Col 1) and Ledger (Col 2 & 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Selector List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3 no-print">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll, or admission #..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="max-h-[550px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg">
            {filteredStudents.map((s) => {
              const cls = classes.find((c) => c.id === s.classId);
              const isSelected = s.id === currentStudent?.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`w-full text-left p-3 text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {s.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {cls?.name} · Adm #{s.admissionNo} (Roll #{s.rollNo})
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Student Fee Profile & Statement */}
        <div className="lg:col-span-2 space-y-6">
          {currentStudent && (
            <>
              {/* Profile Card & KPI Ribbons */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                      {currentStudent.fullName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {currentStudent.fullName}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {studentClass?.name} - Section {studentSection?.name || 'A'} · Admission #{currentStudent.admissionNo} · Roll #{currentStudent.rollNo}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-400 block">Father / Guardian</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentStudent.guardianName}
                    </span>
                    <span className="text-slate-400 block font-mono text-[11px]">
                      {currentStudent.guardianPhone}
                    </span>
                  </div>
                </div>

                {/* 4 Financial Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Total Net Billed</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm tabular-nums">
                      {formatCurrency(lifetimeBilled, settings.currency)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Total Paid to Date</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                      {formatCurrency(lifetimePaid, settings.currency)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Current Outstanding</span>
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        lifetimeOutstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(lifetimeOutstanding, settings.currency)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Discounts / Concession</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm tabular-nums">
                      {lifetimeDiscount > 0 ? formatCurrency(lifetimeDiscount, settings.currency) : 'NIL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Challans Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Challans & Monthly Invoices ({studentFees.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Billing Month</th>
                        <th className="py-3 px-4 text-right">Gross Fee</th>
                        <th className="py-3 px-4 text-right">Discount</th>
                        <th className="py-3 px-4 text-right">Paid</th>
                        <th className="py-3 px-4 text-right">Balance</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right no-print">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentFees.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No fee records on file for this student.
                          </td>
                        </tr>
                      ) : (
                        studentFees.map((fee) => (
                          <tr key={fee.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {fee.invoiceNo}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {fee.month}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                              {formatCurrency(fee.amount, settings.currency)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                              {fee.discount > 0 ? `-${formatCurrency(fee.discount, settings.currency)}` : '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(fee.paidAmount, settings.currency)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                              <span className={fee.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                                {formatCurrency(fee.balance, settings.currency)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <StatusBadge type="fee" status={fee.status} />
                            </td>
                            <td className="py-3 px-4 text-right no-print">
                              <button
                                onClick={() => setSelectedFeeForReceipt(fee)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                title="Print Challan"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Past Payment Receipts for this Student */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Payment Receipts Log ({studentPayments.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Receipt #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Ref #</th>
                        <th className="py-3 px-4 text-right">Amount Paid</th>
                        <th className="py-3 px-4 text-right">Balance Left</th>
                        <th className="py-3 px-4">Accountant</th>
                        <th className="py-3 px-4 text-center no-print">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentPayments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No receipts found for this student yet.
                          </td>
                        </tr>
                      ) : (
                        studentPayments.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {tx.receiptNo}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {formatDate(tx.paymentDate)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {tx.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {tx.referenceNo || '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {formatCurrency(tx.amount, settings.currency)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                              {formatCurrency(tx.newBalance, settings.currency)}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              {tx.accountantName}
                            </td>
                            <td className="py-3 px-4 text-center no-print">
                              <button
                                onClick={() => setSelectedTxForReceipt(tx)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Official Transaction Receipt Modal */}
      <PaymentReceiptModal
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />

      {/* Fee Challan Modal */}
      <FeeReceiptModal
        feeRecord={selectedFeeForReceipt}
        onClose={() => setSelectedFeeForReceipt(null)}
      />
    </div>
  );
};
