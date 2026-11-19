import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Calendar, ClipboardCheck, Filter } from 'lucide-react';

export const ParentAttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { parents, students, classes, attendance } = useApp();

  const currentParent = parents.find(
    (p) => p.id === currentUser?.linkedEntityId || p.email === currentUser?.email
  ) || parents[0];

  const linkedStudents = students.filter((s) => currentParent.linkedStudentIds.includes(s.id));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeStudent = linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];

  const studentRecords = useMemo(() => {
    return attendance
      .filter((a) => a.studentId === activeStudent?.id)
      .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, activeStudent, statusFilter]);

  // Overall attendance calculations
  const allStudentRecords = attendance.filter((a) => a.studentId === activeStudent?.id);
  const present = allStudentRecords.filter((a) => a.status === 'present').length;
  const late = allStudentRecords.filter((a) => a.status === 'late').length;
  const absent = allStudentRecords.filter((a) => a.status === 'absent').length;
  const leave = allStudentRecords.filter((a) => a.status === 'leave').length;
  const total = allStudentRecords.length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 95;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Attendance Log & Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor daily punctuality, medical leaves, and absence notifications.
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Overall Ratio</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{rate}%</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-emerald-600 block text-[10px] uppercase font-semibold">Present Days</span>
          <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums">{present}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-amber-600 block text-[10px] uppercase font-semibold">Late Arrivals</span>
          <span className="text-xl font-bold text-amber-600 font-mono tabular-nums">{late}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-rose-600 block text-[10px] uppercase font-semibold">Uninformed Absences</span>
          <span className="text-xl font-bold text-rose-600 font-mono tabular-nums">{absent}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-blue-600 block text-[10px] uppercase font-semibold">Approved Leaves</span>
          <span className="text-xl font-bold text-blue-600 font-mono tabular-nums">{leave}</span>
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Attendance History for {activeStudent?.fullName}
          </h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Records</option>
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
                <th className="py-3 px-4">Day of Week</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Teacher Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No attendance records found for this filter.
                  </td>
                </tr>
              ) : (
                studentRecords.map((r) => {
                  const dayName = new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' });
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{dayName}</td>
                      <td className="py-3 px-4">
                        <StatusBadge type="attendance" value={r.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{r.remarks || 'Standard attendance'}</td>
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
