import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  AlertCircle,
  ShieldAlert,
  Printer,
  Download,
  Receipt,
  Phone,
  Search,
  Filter,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const OutstandingFeesPage: React.FC = () => {
  const navigate = useNavigate();
  const { fees, students, classes, settings, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'overdue' | 'partial' | 'unpaid'>('all');
  const [minBalance, setMinBalance] = useState<number>(0);
  const [isPrintReportMode, setIsPrintReportMode] = useState(false);

  // Filter records with balance > 0
  const outstandingRecords = useMemo(() => {
    return fees.filter((f) => {
      if (f.balance <= 0) return false;

      const student = students.find((s) => s.id === f.studentId);
      const matchesSearch =
        searchTerm === '' ||
        student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.guardianPhone.includes(searchTerm) ||
        f.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassId === 'all' || f.classId === selectedClassId;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'overdue' && f.status === 'overdue') ||
        (selectedStatus === 'partial' && f.status === 'partial') ||
        (selectedStatus === 'unpaid' && f.status === 'unpaid');
      const matchesMin = f.balance >= minBalance;

      return matchesSearch && matchesClass && matchesStatus && matchesMin;
    });
  }, [fees, students, searchTerm, selectedClassId, selectedStatus, minBalance]);

  // Totals
  const totalOutstanding = useMemo(
    () => outstandingRecords.reduce((sum, f) => sum + f.balance, 0),
    [outstandingRecords]
  );
  const overdueOnlyTotal = useMemo(
    () =>
      outstandingRecords
        .filter((f) => f.status === 'overdue')
        .reduce((sum, f) => sum + f.balance, 0),
    [outstandingRecords]
  );
  const overdueCount = useMemo(
    () => outstandingRecords.filter((f) => f.status === 'overdue').length,
    [outstandingRecords]
  );
  const partialCount = useMemo(
    () => outstandingRecords.filter((f) => f.status === 'partial').length,
    [outstandingRecords]
  );

  const handleExportCSV = () => {
    const data = outstandingRecords.map((f) => {
      const s = students.find((std) => std.id === f.studentId);
      const c = classes.find((cls) => cls.id === f.classId);
      return {
        'Invoice No': f.invoiceNo,
        'Admission No': s?.admissionNo || '',
        'Student Name': s?.fullName || '',
        Class: c?.name || '',
        Month: f.month,
        'Total Fee (PKR)': f.netAmount,
        'Paid (PKR)': f.paidAmount,
        'Outstanding Balance (PKR)': f.balance,
        Status: f.status.toUpperCase(),
        'Due Date': f.dueDate,
        'Guardian Name': s?.guardianName || '',
        'Guardian Phone': s?.guardianPhone || '',
      };
    });
    exportToCSV(data, `outstanding_fees_report_${Date.now()}.csv`);
    addToast('info', 'Outstanding fee defaulters list exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Outstanding & Overdue Fee Ledgers
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded">
              Defaulters Watchlist
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track unpaid challans, partial balance dues, and delinquent student accounts requiring recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Defaulters Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (Visible when printed) */}
      <div className="hidden print:block p-4 border-b border-slate-300 mb-4 text-center">
        <h2 className="text-xl font-bold uppercase">{settings.name}</h2>
        <p className="text-xs text-slate-600">{settings.address} · Phone: {settings.phone}</p>
        <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-rose-700">
          Institutional Outstanding & Overdue Fee Defaulters Report
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Generated on: {formatDate(new Date().toISOString().split('T')[0])} · Total Dues: PKR {totalOutstanding.toLocaleString()}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Total Outstanding</span>
          </div>
          <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            {formatCurrency(totalOutstanding, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Across {outstandingRecords.length} pending records
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Overdue Amount</span>
          </div>
          <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300 tabular-nums">
            {formatCurrency(overdueOnlyTotal, settings.currency)}
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5 font-medium">
            {overdueCount} critical defaulters
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Partial Payments</span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {partialCount} Challans
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Partial installment received
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 mb-1">
            Average Due per Student
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(
              outstandingRecords.length ? totalOutstanding / outstandingRecords.length : 0,
              settings.currency
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Institutional recovery target
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student, roll #, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
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
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Outstanding (Overdue + Partial + Unpaid)</option>
            <option value="overdue">Overdue Only</option>
            <option value="partial">Partially Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>

          {/* Minimum Balance Filter */}
          <select
            value={minBalance}
            onChange={(e) => setMinBalance(Number(e.target.value))}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value={0}>Any Balance Amount</option>
            <option value={3000}>Min PKR 3,000</option>
            <option value={5000}>Min PKR 5,000</option>
            <option value={8000}>Min PKR 8,000</option>
          </select>
        </div>
      </div>

      {/* Outstanding Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Guardian & Phone</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Net Fee</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Remaining Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {outstandingRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No outstanding fee balances found matching the active filters!
                  </td>
                </tr>
              ) : (
                outstandingRecords.map((fee) => {
                  const student = students.find((s) => s.id === fee.studentId);
                  const classItem = classes.find((c) => c.id === fee.classId);

                  return (
                    <tr
                      key={fee.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {student?.fullName || 'Student'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {student?.admissionNo}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {classItem?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {student?.guardianName || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student?.guardianPhone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {fee.month}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {formatDate(fee.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {formatCurrency(fee.netAmount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {fee.paidAmount > 0 ? formatCurrency(fee.paidAmount, settings.currency) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatCurrency(fee.balance, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge type="fee" status={fee.status} />
                      </td>
                      <td className="py-3 px-4 text-right no-print">
                        <button
                          onClick={() =>
                            navigate(
                              `/accountant/record-payment?feeId=${fee.id}&studentId=${fee.studentId}`
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Collect</span>
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
    </div>
  );
};
