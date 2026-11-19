import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentReceiptModal } from '../../components/common/PaymentReceiptModal';
import { PaymentTransaction, FeeRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  UserCheck,
  Building2,
  Calendar,
  History,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const RecordPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fees, students, classes, recordPaymentTransaction, settings, addToast } = useApp();
  const { currentUser } = useAuth();

  const prefillFeeId = searchParams.get('feeId');
  const prefillStudentId = searchParams.get('studentId');

  // Form State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(prefillStudentId || '');
  const [selectedFeeId, setSelectedFeeId] = useState<string>(prefillFeeId || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('Cash');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [accountantName, setAccountantName] = useState(currentUser?.name || 'Muhammad Arif');

  // Completed transaction for instant receipt display
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(null);

  // Filter students for picker
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students.slice(0, 8);
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.rollNo.includes(q)
    ).slice(0, 10);
  }, [students, studentSearch]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedStudentClass = classes.find((c) => c.id === selectedStudent?.classId);
  const selectedStudentSection = selectedStudentClass?.sections.find(
    (sec) => sec.id === selectedStudent?.sectionId
  );

  // Fee records for the selected student with outstanding balance > 0
  const studentPendingFees = useMemo(() => {
    if (!selectedStudentId) return [];
    return fees.filter((f) => f.studentId === selectedStudentId && f.balance > 0);
  }, [fees, selectedStudentId]);

  // All student fees (including cleared) for reference
  const allStudentFees = useMemo(() => {
    if (!selectedStudentId) return [];
    return fees.filter((f) => f.studentId === selectedStudentId);
  }, [fees, selectedStudentId]);

  // Currently chosen fee record
  const selectedFee = useMemo(() => {
    if (!selectedFeeId) return studentPendingFees[0] || null;
    return fees.find((f) => f.id === selectedFeeId) || null;
  }, [fees, selectedFeeId, studentPendingFees]);

  // Auto-select fee if none picked and student changes
  useEffect(() => {
    if (selectedStudentId && studentPendingFees.length > 0 && !selectedFeeId) {
      setSelectedFeeId(studentPendingFees[0].id);
      setAmount(studentPendingFees[0].balance);
    }
  }, [selectedStudentId, studentPendingFees, selectedFeeId]);

  // If prefilled feeId was provided
  useEffect(() => {
    if (prefillFeeId) {
      const targetFee = fees.find((f) => f.id === prefillFeeId);
      if (targetFee) {
        setSelectedFeeId(targetFee.id);
        setSelectedStudentId(targetFee.studentId);
        setAmount(targetFee.balance);
      }
    }
  }, [prefillFeeId, fees]);

  const handleSelectFeeRecord = (fee: FeeRecord) => {
    setSelectedFeeId(fee.id);
    setAmount(fee.balance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFee) {
      addToast('error', 'Please select an unpaid fee record');
      return;
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      addToast('error', 'Payment amount must be greater than zero');
      return;
    }

    if (payAmount > selectedFee.balance) {
      addToast(
        'error',
        `Payment cannot exceed outstanding balance of PKR ${selectedFee.balance.toLocaleString()}`
      );
      return;
    }

    const result = recordPaymentTransaction({
      feeRecordId: selectedFee.id,
      amount: payAmount,
      paymentMethod,
      paymentDate,
      referenceNo: referenceNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
      accountantName: accountantName.trim() || 'Muhammad Arif',
    });

    if (result.success && result.transaction) {
      setCompletedTransaction(result.transaction);
      // Reset payment fields
      setAmount('');
      setReferenceNo('');
      setRemarks('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Record Fee Payment
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded">
              Counter Cashier Slip
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accept counter payments, partial settlements, bank transfer slips, and issue official receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/accountant/payments')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>Payment History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Student & Outstanding Invoices Selection (Col 1) */}
        <div className="space-y-4">
          {/* Student Search & Picker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Step 1: Locate Student</span>
            </h3>

            <div className="relative mb-3">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search name or roll #..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg">
              {filteredStudents.map((s) => {
                const cls = classes.find((c) => c.id === s.classId);
                const isSelected = s.id === selectedStudentId;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setSelectedFeeId('');
                      setAmount('');
                    }}
                    className={`w-full text-left p-2.5 text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{s.fullName}</div>
                      <div className="text-[10px] text-slate-400">
                        {cls?.name} · {s.admissionNo} (Roll: {s.rollNo})
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Profile Snapshot */}
          {selectedStudent && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs text-xs space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Selected Student Profile
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedStudent.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admission No:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedStudent.admissionNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class & Section:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedStudentClass?.name} - {selectedStudentSection?.name || 'A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Name:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedStudent.guardianName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Phone:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedStudent.guardianPhone}
                </span>
              </div>
            </div>
          )}

          {/* Outstanding Challans for Student */}
          {selectedStudent && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Pending Challans ({studentPendingFees.length})
              </h3>

              {studentPendingFees.length === 0 ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>No outstanding dues for this student! All fees cleared.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {studentPendingFees.map((fee) => {
                    const isPicked = selectedFee?.id === fee.id;
                    return (
                      <div
                        key={fee.id}
                        onClick={() => handleSelectFeeRecord(fee)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isPicked
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {fee.month}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              fee.status === 'overdue'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {fee.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Net: {formatCurrency(fee.netAmount, settings.currency)}</span>
                          <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                            Due: {formatCurrency(fee.balance, settings.currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Payment Details Form (Col 2 & 3) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Step 2: Payment Receipt Entry</span>
              {selectedFee && (
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                  {selectedFee.invoiceNo} · {selectedFee.month}
                </span>
              )}
            </h3>

            {!selectedFee ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs">
                  Please select a student and an outstanding fee challan from the left panel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Financial Summary Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tuition Fee</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {formatCurrency(selectedFee.amount, settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Discount</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                      {selectedFee.discount > 0
                        ? `-${formatCurrency(selectedFee.discount, settings.currency)}`
                        : 'PKR 0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Already Paid</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {formatCurrency(selectedFee.paidAmount, settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Outstanding Due</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                      {formatCurrency(selectedFee.balance, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Amount to Pay */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-800 dark:text-slate-200">
                      Amount Received (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAmount(selectedFee.balance)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded hover:bg-blue-100"
                      >
                        Full Due ({formatCurrency(selectedFee.balance, settings.currency)})
                      </button>
                      {selectedFee.balance > 2000 && (
                        <button
                          type="button"
                          onClick={() => setAmount(Math.round(selectedFee.balance / 2))}
                          className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200"
                        >
                          50% ({formatCurrency(Math.round(selectedFee.balance / 2), settings.currency)})
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      PKR
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedFee.balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter amount..."
                      className="w-full pl-12 pr-4 py-2.5 text-base font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {Number(amount) > 0 && (
                    <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                      <span>
                        Remaining balance after payment:
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(
                          Math.max(0, selectedFee.balance - Number(amount)),
                          settings.currency
                        )}
                        {selectedFee.balance - Number(amount) <= 0 && (
                          <span className="text-emerald-600 ml-1">(Cleared)</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      <option value="Cash">Cash (Counter Cashier)</option>
                      <option value="Bank Transfer">Bank Transfer (1-Link / IBFT)</option>
                      <option value="Online Slip">Online Slip / Digital Receipt</option>
                      <option value="Cheque">Bank Cheque / Pay Order</option>
                      <option value="Other">Other / Counter Voucher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payment Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Reference No & Accountant Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Reference / Transaction # (Optional)
                    </label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="e.g. CSH-1029, HBL-FT-88192, CHQ-4029"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Receiving Accountant / Cashier
                    </label>
                    <input
                      type="text"
                      value={accountantName}
                      onChange={(e) => setAccountantName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Remarks / Bank Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Sibling concession applied, balance PKR 2,000 promised by 20th October..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Receipt number will be automatically generated and printed.
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Confirm & Generate Receipt</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Payment Receipt Modal on Completion */}
      <PaymentReceiptModal
        transaction={completedTransaction}
        onClose={() => setCompletedTransaction(null)}
      />
    </div>
  );
};
