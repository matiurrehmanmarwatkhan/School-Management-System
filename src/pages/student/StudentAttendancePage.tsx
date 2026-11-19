import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, attendance } = useApp();

  const currentStudent = students.find(
    (s) => s.id === currentUser?.linkedEntityId || s.email === currentUser?.email
  ) || students[0];

  const [statusFilter, setStatusFilter] = useState('all');

  const myRecords = useMemo(() => {
    return attendance
      .filter((a) => a.studentId === currentStudent.id)
      .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, currentStudent.id, statusFilter]);

  const allRecords = attendance.filter((a) => a.studentId === currentStudent.id);
  const present = allRecords.filter((a) => a.status === 'present').length;
  const late = allRecords.filter((a) => a.status === 'late').length;
  const absent = allRecords.filter((a) => a.status === 'absent').length;
  const leave = allRecords.filter((a) => a.status === 'leave').length;
  const total = allRecords.length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 96;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          My Attendance Register
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Read-only verified log of daily lecture attendance and punctuality records.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attendance Rate</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{rate}%</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-emerald-600 block text-[10px] uppercase font-semibold">Present Days</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">{present}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-amber-600 block text-[10px] uppercase font-semibold">Late Arrivals</span>
          <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums">{late}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-rose-600 block text-[10px] uppercase font-semibold">Absences</span>
          <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums">{absent}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recorded Attendance Dates
          </h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Dates</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myRecords.map((r) => {
                const day = new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{day}</td>
                    <td className="py-3 px-4">
                      <StatusBadge type="attendance" value={r.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{r.remarks || 'Regular presence'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
