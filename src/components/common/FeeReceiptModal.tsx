import React from 'react';
import { Modal } from './Modal';
import { FeeRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer } from 'lucide-react';

interface FeeReceiptModalProps {
  feeRecord: FeeRecord | null;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ feeRecord, onClose }) => {
  const { students, classes, settings } = useApp();

  if (!feeRecord) return null;

  const student = students.find((s) => s.id === feeRecord.studentId);
  const classItem = classes.find((c) => c.id === feeRecord.classId);
  const sectionItem = classItem?.sections.find((sec) => sec.id === student?.sectionId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!feeRecord}
      onClose={onClose}
      title="Fee Challan / Official Receipt"
      description={`Invoice: ${feeRecord.invoiceNo}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 printable-card">
        {/* Printable Receipt Card */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-xs">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              {settings.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{settings.motto}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {settings.address} · Phone: {settings.phone}
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider rounded-md">
              Fee Collection Receipt (Student & Accounts Copy)
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">Challan / Inv No.</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {feeRecord.invoiceNo}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Billing Period</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {feeRecord.month}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Due Date</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {formatDate(feeRecord.dueDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Date</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {feeRecord.paymentDate ? formatDate(feeRecord.paymentDate) : 'Pending'}
              </span>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-xs border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-3 rounded-lg my-3">
            <div>
              <span className="text-slate-400 block">Student Name</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {student?.fullName || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Admission / Roll No.</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {student?.admissionNo} (Roll: {student?.rollNo})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Class & Section</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {classItem?.name} - Section {sectionItem?.name || 'A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Guardian / Father</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {student?.guardianName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Contact</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {student?.guardianPhone}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {feeRecord.paymentMethod || 'Cash / Counter'}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
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
                  <td className="py-2.5 text-slate-700 dark:text-slate-200">
                    Tuition Fee ({classItem?.name})
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {formatCurrency(feeRecord.amount, settings.currency)}
                  </td>
                </tr>
                {feeRecord.discount > 0 && (
                  <tr>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400">
                      Scholarship / Concession / Sibling Discount
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      - {formatCurrency(feeRecord.discount, settings.currency)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-slate-200 dark:border-slate-700 font-semibold">
                  <td className="py-2.5 text-slate-900 dark:text-slate-100">Net Payable Amount</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatCurrency(feeRecord.netAmount, settings.currency)}
                  </td>
                </tr>
                <tr className="text-blue-600 dark:text-blue-400 font-medium">
                  <td className="py-2.5">Amount Paid to Date</td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    {formatCurrency(feeRecord.paidAmount, settings.currency)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                  <td className="py-2.5 text-slate-900 dark:text-slate-100">Remaining Balance</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400">
                    {formatCurrency(feeRecord.balance, settings.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          {feeRecord.remarks && (
            <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Notes / Remarks: </span>
              {feeRecord.remarks}
            </div>
          )}

          {/* Stamp & Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-1 text-slate-500">
                Depositor / Guardian Signature
              </div>
            </div>
            <div>
              <div className="h-10 flex items-center justify-center">
                {feeRecord.status === 'paid' && (
                  <span className="px-3 py-0.5 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-[10px] rotate-[-5deg] rounded">
                    PAID & VERIFIED
                  </span>
                )}
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-1 text-slate-500">
                Authorized Officer / Cashier
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 no-print">
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
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
