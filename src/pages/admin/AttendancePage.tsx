import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { ClipboardCheck, Check, Clock, AlertCircle, FileText, Save, CheckCheck } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { classes, students, attendance, saveAttendanceBatch } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(classes[0]?.sections[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-10-16');

  // Local attendance edit draft for the current class/section/date
  const [draftStatuses, setDraftStatuses] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Active students in selected class & section
  const currentStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === selectedClassId && s.sectionId === selectedSectionId && s.status === 'active'
    );
  }, [students, selectedClassId, selectedSectionId]);

  // Sync draft statuses whenever class, section, or date changes
  useEffect(() => {
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    currentStudents.forEach((s) => {
      const existing = attendance.find(
        (a) => a.studentId === s.id && a.date === selectedDate
      );
      if (existing) {
        map[s.id] = { status: existing.status, remarks: existing.remarks || '' };
      } else {
        map[s.id] = { status: 'present', remarks: '' };
      }
    });
    setDraftStatuses(map);
    setIsDirty(false);
  }, [selectedClassId, selectedSectionId, selectedDate, currentStudents, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setIsDirty(true);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    currentStudents.forEach((s) => {
      updated[s.id] = { status: 'present', remarks: '' };
    });
    setDraftStatuses(updated);
    setIsDirty(true);
  };

  const handleSaveAttendance = () => {
    const records = currentStudents.map((s) => ({
      studentId: s.id,
      classId: selectedClassId,
      sectionId: selectedSectionId,
      date: selectedDate,
      status: draftStatuses[s.id]?.status || 'present',
      remarks: draftStatuses[s.id]?.remarks || '',
    }));
    saveAttendanceBatch(records);
    setIsDirty(false);
  };

  // Summary counts for this date
  const summary = useMemo(() => {
    let p = 0, a = 0, l = 0, lv = 0;
    currentStudents.forEach((s) => {
      const st = draftStatuses[s.id]?.status || 'present';
      if (st === 'present') p++;
      else if (st === 'absent') a++;
      else if (st === 'late') l++;
      else if (st === 'leave') lv++;
    });
    const total = currentStudents.length;
    const rate = total > 0 ? Math.round(((p + l) / total) * 100) : 0;
    return { present: p, absent: a, late: l, leave: lv, rate, total };
  }, [currentStudents, draftStatuses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Attendance Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record, audit, and modify daily student attendance registers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={!isDirty}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isDirty ? 'Save Attendance Records' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
              Academic Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const newClassId = e.target.value;
                setSelectedClassId(newClassId);
                const targetCls = classes.find((c) => c.id === newClassId);
                setSelectedSectionId(targetCls?.sections[0]?.id || '');
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
              Class Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              {classes
                .find((c) => c.id === selectedClassId)
                ?.sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
        </div>

        {/* Real-time Section Metric Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
            <span>
              Total: <strong className="tabular-nums font-mono">{summary.total}</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Present: <strong className="tabular-nums font-mono">{summary.present}</strong>
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              Late: <strong className="tabular-nums font-mono">{summary.late}</strong>
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              Absent: <strong className="tabular-nums font-mono">{summary.absent}</strong>
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              Leave: <strong className="tabular-nums font-mono">{summary.leave}</strong>
            </span>
          </div>

          <div className="text-xs">
            Attendance Rate:{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {summary.rate}%
            </span>
          </div>
        </div>
      </div>

      {/* Student Attendance Register Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Status Selection</th>
                <th className="py-3 px-4">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No active students enrolled in this section.
                  </td>
                </tr>
              ) : (
                currentStudents.map((std) => {
                  const currentDraft = draftStatuses[std.id] || { status: 'present', remarks: '' };
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {std.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {std.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{std.admissionNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        {/* Interactive Segmented Control for Attendance Status */}
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {(
                            [
                              { key: 'present', label: 'Present', activeColor: 'bg-emerald-600 text-white' },
                              { key: 'late', label: 'Late', activeColor: 'bg-amber-600 text-white' },
                              { key: 'absent', label: 'Absent', activeColor: 'bg-rose-600 text-white' },
                              { key: 'leave', label: 'Leave', activeColor: 'bg-blue-600 text-white' },
                            ] as const
                          ).map((btn) => (
                            <button
                              key={btn.key}
                              type="button"
                              onClick={() => handleStatusChange(std.id, btn.key)}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                                currentDraft.status === btn.key
                                  ? `${btn.activeColor} shadow-xs font-semibold`
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentDraft.remarks}
                          onChange={(e) => handleRemarksChange(std.id, e.target.value)}
                          placeholder="Optional remarks (e.g. sick leave, traffic)"
                          className="w-full max-w-sm px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                        />
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
