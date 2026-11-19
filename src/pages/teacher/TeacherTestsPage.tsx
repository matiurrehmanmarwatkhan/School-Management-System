import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Test, StudentMark } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { formatDate, calculateGrade } from '../../utils/formatters';
import { FileSpreadsheet, Plus, Edit2, Send, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export const TeacherTestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teachers, classes, subjects, students, tests, saveTest, publishTest, deleteTest, addToast } = useApp();

  const currentTeacher = teachers.find(
    (t) => t.id === currentUser?.linkedEntityId || t.email === currentUser?.email
  ) || teachers[4];

  const assignedSubjects = subjects.filter((s) => currentTeacher.subjectIds.includes(s.id));
  const myTests = useMemo(() => {
    return tests.filter((t) => t.teacherId === currentTeacher.id);
  }, [tests, currentTeacher.id]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [viewingTest, setViewingTest] = useState<Test | null>(null);
  const [publishingTestId, setPublishingTestId] = useState<string | null>(null);

  // Form State for Test Creation
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(currentTeacher.assignments[0]?.classId || classes[0]?.id || '');
  const [sectionId, setSectionId] = useState(currentTeacher.assignments[0]?.sectionId || '');
  const [subjectId, setSubjectId] = useState(assignedSubjects[0]?.id || '');
  const [date, setDate] = useState('2026-10-18');
  const [totalMarks, setTotalMarks] = useState(50);
  const [passingMarks, setPassingMarks] = useState(20);

  // Marks entry state
  const [marksDraft, setMarksDraft] = useState<Record<string, { marksObtained: number; remarks: string }>>({});

  const cohortStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === classId && s.sectionId === sectionId && s.status === 'active'
    );
  }, [students, classId, sectionId]);

  const openCreateModal = () => {
    setTitle('Physics Chapter 4 Assessment');
    setClassId(currentTeacher.assignments[0]?.classId || classes[0]?.id || '');
    setSectionId(currentTeacher.assignments[0]?.sectionId || '');
    setSubjectId(assignedSubjects[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setTotalMarks(50);
    setPassingMarks(20);

    const initialMarks: Record<string, { marksObtained: number; remarks: string }> = {};
    cohortStudents.forEach((s) => {
      initialMarks[s.id] = { marksObtained: 35, remarks: 'Good analytical reasoning' };
    });
    setMarksDraft(initialMarks);
    setIsCreateOpen(true);
  };

  const openEditModal = (t: Test) => {
    setEditingTest(t);
    setTitle(t.title);
    setClassId(t.classId);
    setSectionId(t.sectionId);
    setSubjectId(t.subjectId);
    setDate(t.date);
    setTotalMarks(t.totalMarks);
    setPassingMarks(t.passingMarks);

    const initialMarks: Record<string, { marksObtained: number; remarks: string }> = {};
    t.marks.forEach((m) => {
      initialMarks[m.studentId] = { marksObtained: m.marksObtained, remarks: m.remarks || '' };
    });
    setMarksDraft(initialMarks);
  };

  const handleMarksChange = (studentId: string, val: number) => {
    if (val < 0) val = 0;
    if (val > totalMarks) val = totalMarks;
    setMarksDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], marksObtained: val },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setMarksDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSaveDraftOrPublish = (status: 'draft' | 'published') => {
    const studentMarks: StudentMark[] = cohortStudents.map((s) => {
      const draft = marksDraft[s.id] || { marksObtained: 0, remarks: '' };
      const percentage = Math.round((draft.marksObtained / totalMarks) * 100 * 10) / 10;
      const { grade } = calculateGrade(percentage);
      return {
        studentId: s.id,
        marksObtained: draft.marksObtained,
        percentage,
        grade,
        remarks: draft.remarks,
      };
    });

    saveTest({
      id: editingTest?.id,
      title,
      classId,
      sectionId,
      subjectId,
      teacherId: currentTeacher.id,
      date,
      totalMarks,
      passingMarks,
      status,
      marks: studentMarks,
    });

    setIsCreateOpen(false);
    setEditingTest(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Assessment Creation & Grading
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create evaluations, enter student scores with auto-percentage calculation, and publish to parent/student portals.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Tests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 font-mono">Date</th>
                <th className="py-3 px-4 text-right">Total Marks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No assessments recorded yet.
                  </td>
                </tr>
              ) : (
                myTests.map((t) => {
                  const cls = classes.find((c) => c.id === t.classId);
                  const subj = subjects.find((s) => s.id === t.subjectId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {t.title}
                      </td>
                      <td className="py-3 px-4">{cls?.name}</td>
                      <td className="py-3 px-4">{subj?.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatDate(t.date)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                        {t.totalMarks}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="test" value={t.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {t.status === 'draft' ? (
                            <>
                              <button
                                onClick={() => openEditModal(t)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              >
                                Edit Marks
                              </button>
                              <button
                                onClick={() => setPublishingTestId(t.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>Publish</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setViewingTest(t)}
                              className="px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Results</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Creation & Grading Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingTest}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTest(null);
        }}
        title={editingTest ? 'Edit Assessment & Grading' : 'Create New Assessment & Enter Marks'}
        description="Enter test parameters and grade student answer sheets with real-time validation"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-xs">
          {/* Header Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <div>
              <label className="block font-medium mb-1">Assessment Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Target Cohort *</label>
              <select
                value={`${classId}__${sectionId}`}
                onChange={(e) => {
                  const [c, s] = e.target.value.split('__');
                  setClassId(c);
                  setSectionId(s);
                }}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
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
              <label className="block font-medium mb-1">Subject Curriculum *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                {assignedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Date Conducted</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Total Marks *</label>
              <input
                type="number"
                min={1}
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Passing Threshold</label>
              <input
                type="number"
                min={1}
                required
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Student Grading Roster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Candidate Mark Register ({cohortStudents.length} Students)
              </span>
              <span className="text-[11px] text-slate-400">
                Percentages and grades compute automatically
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase sticky top-0 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Roll #</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 w-28">Obtained Marks</th>
                    <th className="py-2.5 px-3 text-right">Percentage</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cohortStudents.map((std) => {
                    const currentMarks = marksDraft[std.id]?.marksObtained ?? 0;
                    const currentRemarks = marksDraft[std.id]?.remarks || '';
                    const pct = totalMarks > 0 ? Math.round((currentMarks / totalMarks) * 100 * 10) / 10 : 0;
                    const { grade, color } = calculateGrade(pct);

                    return (
                      <tr key={std.id}>
                        <td className="py-2 px-3 font-mono font-medium">{std.rollNo}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {std.fullName}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min={0}
                            max={totalMarks}
                            value={currentMarks}
                            onChange={(e) => handleMarksChange(std.id, Number(e.target.value))}
                            className="w-20 px-2 py-1 font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                          {pct}%
                        </td>
                        <td className={`py-2 px-3 text-center font-bold ${color}`}>
                          {grade}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={currentRemarks}
                            onChange={(e) => handleRemarksChange(std.id, e.target.value)}
                            placeholder="Optional remark..."
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingTest(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveDraftOrPublish('draft')}
              className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveDraftOrPublish('published')}
              className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Publish Results Directly
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation to Publish */}
      <ConfirmationDialog
        isOpen={!!publishingTestId}
        onClose={() => setPublishingTestId(null)}
        onConfirm={() => {
          if (publishingTestId) publishTest(publishingTestId);
          setPublishingTestId(null);
        }}
        title="Publish Results to Portals?"
        message="Once published, these scores and teacher remarks will be visible to parents and students on their portal dashboards."
        confirmLabel="Confirm & Publish"
        isDestructive={false}
      />

      {/* Results Viewer Modal */}
      {viewingTest && (
        <Modal
          isOpen={!!viewingTest}
          onClose={() => setViewingTest(null)}
          title={viewingTest.title}
          description="Official Grade Sheet"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2 px-3">Roll #</th>
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3 text-right">Marks</th>
                    <th className="py-2 px-3 text-right">Percentage</th>
                    <th className="py-2 px-3 text-center">Grade</th>
                    <th className="py-2 px-3">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {viewingTest.marks.map((m) => {
                    const std = students.find((s) => s.id === m.studentId);
                    return (
                      <tr key={m.studentId}>
                        <td className="py-2 px-3 font-mono">{std?.rollNo}</td>
                        <td className="py-2 px-3 font-semibold">{std?.fullName}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {m.marksObtained} / {viewingTest.totalMarks}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                          {m.percentage}%
                        </td>
                        <td className="py-2 px-3 text-center font-bold">{m.grade}</td>
                        <td className="py-2 px-3 text-slate-500">{m.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
