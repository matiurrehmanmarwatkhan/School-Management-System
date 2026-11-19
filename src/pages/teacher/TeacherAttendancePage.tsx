import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { ClipboardCheck, CheckCheck, Save, Calendar } from 'lucide-react';

export const TeacherAttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teachers, classes, students, attendance, saveAttendanceBatch } = useApp();

  const currentTeacher = teachers.find(
    (t) => t.id === currentUser?.linkedEntityId || t.email === currentUser?.email
  ) || teachers[4];

  const [selectedClassId, setSelectedClassId] = useState(currentTeacher.assignments[0]?.classId || classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(currentTeacher.assignments[0]?.sectionId || '');
  const [selectedDate, setSelectedDate] = useState('2026-10-16');

  const [draftStatuses, setDraftStatuses] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [isDirty, setIsDirty] = useState(false);

  const cohortStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === selectedClassId && s.sectionId === selectedSectionId && s.status === 'active'
    );
  }, [students, selectedClassId, selectedSectionId]);

  useEffect(() => {
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    cohortStudents.forEach((s) => {
      const existing = attendance.find((a) => a.studentId === s.id && a.date === selectedDate);
      if (existing) {
        map[s.id] = { status: existing.status, remarks: existing.remarks || '' };
      } else {
        map[s.id] = { status: 'present', remarks: '' };
      }
    });
    setDraftStatuses(map);
    setIsDirty(false);
  }, [selectedClassId, selectedSectionId, selectedDate, cohortStudents, attendance]);

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
    cohortStudents.forEach((s) => {
      updated[s.id] = { status: 'present', remarks: '' };
    });
    setDraftStatuses(updated);
    setIsDirty(true);
  };

  const handleSave = () => {
    const records = cohortStudents.map((s) => ({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Student Attendance Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record roll call for your assigned lecture sessions.
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
            onClick={handleSave}
            disabled={!isDirty}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isDirty ? 'Save Attendance' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* Cohort & Date Selectors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
              Assigned Cohort
            </label>
            <select
              value={`${selectedClassId}__${selectedSectionId}`}
              onChange={(e) => {
                const [cid, sid] = e.target.value.split('__');
                setSelectedClassId(cid);
                setSelectedSectionId(sid);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
            >
              {currentTeacher.assignments.map((a, i) => {
                const cls = classes.find((c) => c.id === a.classId);
                const sec = cls?.sections.find((s) => s.id === a.sectionId);
                return (
                  <option key={i} value={`${a.classId}__${a.sectionId}`}>
                    {cls?.name} — Section {sec?.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
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
      </div>

      {/* Roll Call Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cohortStudents.map((std) => {
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
                        placeholder="Remarks..."
                        className="w-full max-w-sm px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                      />
                    </td>
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
