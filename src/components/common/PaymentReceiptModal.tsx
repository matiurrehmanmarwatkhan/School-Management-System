import React from 'react';
import { Modal } from './Modal';
import { PaymentTransaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, CheckCircle, School } from 'lucide-react';

interface PaymentReceiptModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const { students, classes, fees, settings } = useApp();

  if (!transaction) return null;

  const student = students.find((s) => s.id === transaction.studentId);
  const classItem = classes.find((c) => c.id === transaction.classId);
  const sectionItem = classItem?.sections.find((sec) => sec.id === student?.sectionId);
  const feeRecord = fees.find((f) => f.id === transaction.feeRecordId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!transaction}
      onClose={onClose}
      title="Official Payment Receipt"
      description={`Receipt No: ${transaction.receiptNo}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 printable-card">
        {/* Printable Card Area */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-xs">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg mb-2 shadow-xs">
              {settings.logoText || <School className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              {settings.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{settings.motto}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {settings.address} · Phone: {settings.phone}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold uppercase tracking-wider rounded-md">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Official Fee Collection Receipt (Accounts & Student Copy)</span>
            </div>
          </div>

          {/* Receipt Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">Receipt Number</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {transaction.receiptNo}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Fee Month / Period</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {feeRecord?.month || 'Tuition Fee'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Date</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {formatDate(transaction.paymentDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {transaction.paymentMethod}
              </span>
            </div>
          </div>

          {/* Student & Guardian Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3 text-xs border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 px-3 rounded-lg my-3">
            <div>
              <span className="text-slate-400 block">Student Name</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {student?.fullName || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Admission / Roll No</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {student?.admissionNo} (Roll #{student?.rollNo})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Class & Section</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {classItem?.name} - Section {sectionItem?.name || 'A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Father / Guardian</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {student?.guardianName || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Contact Phone</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {student?.guardianPhone || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Invoice Reference</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {feeRecord?.invoiceNo || '-'}
              </span>
            </div>
          </div>

          {/* Payment Financial Breakdown */}
          <div className="mt-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider text-left">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2 text-slate-700 dark:text-slate-300">
                    Gross Tuition Fee ({feeRecord?.month || 'Current Period'})
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {formatCurrency(feeRecord?.amount || transaction.amount, settings.currency)}
                  </td>
                </tr>
                {feeRecord && feeRecord.discount > 0 && (
                  <tr>
                    <td className="py-2 text-emerald-600 dark:text-emerald-400">
                      Scholarship / Concession / Sibling Discount
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      - {formatCurrency(feeRecord.discount, settings.currency)}
                    </td>
                  </tr>
                )}
                {feeRecord && (
                  <tr className="font-medium text-slate-700 dark:text-slate-300">
                    <td className="py-2">Net Payable Amount</td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {formatCurrency(feeRecord.netAmount, settings.currency)}
                    </td>
                  </tr>
                )}
                <tr className="text-slate-500">
                  <td className="py-2">Balance Before This Payment</td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {formatCurrency(transaction.previousBalance, settings.currency)}
                  </td>
                </tr>
                <tr className="border-t border-b border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-300">
                  <td className="py-2.5 px-2">CURRENT PAYMENT RECEIVED</td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-sm">
                    {formatCurrency(transaction.amount, settings.currency)}
                  </td>
                </tr>
                <tr className="font-semibold text-slate-900 dark:text-slate-100">
                  <td className="py-2.5">Remaining Outstanding Balance</td>
                  <td className={`py-2.5 text-right font-mono tabular-nums ${
                    transaction.newBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {transaction.newBalance > 0
                      ? formatCurrency(transaction.newBalance, settings.currency)
                      : 'NIL (FULLY CLEARED)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reference and Remarks */}
          {(transaction.referenceNo || transaction.remarks) && (
            <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs space-y-1">
              {transaction.referenceNo && (
                <div>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Transaction / Reference ID: </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{transaction.referenceNo}</span>
                </div>
              )}
              {transaction.remarks && (
                <div>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Notes / Remarks: </span>
                  <span className="text-slate-700 dark:text-slate-300">{transaction.remarks}</span>
                </div>
              )}
            </div>
          )}

          {/* Signatures & Verification */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-1 text-slate-500">
                Depositor / Student Signature
              </div>
            </div>
            <div>
              <div className="h-10 flex flex-col items-center justify-center">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{transaction.accountantName}</span>
                <span className="text-[10px] text-slate-400">School Accounts Officer</span>
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-1 text-slate-500">
                Authorized Cashier / Accountant Signature
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-3 no-print">
          <span className="text-[11px] text-slate-400">
            Use system print dialog to print hardcopy or Save as PDF.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
