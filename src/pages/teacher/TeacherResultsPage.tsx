import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { Award, Eye, Users, FileText } from 'lucide-react';

export const TeacherResultsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teachers, classes, subjects, students, tests } = useApp();

  const currentTeacher = teachers.find(
    (t) => t.id === currentUser?.linkedEntityId || t.email === currentUser?.email
  ) || teachers[4];

  const publishedTests = useMemo(() => {
    return tests.filter((t) => t.teacherId === currentTeacher.id && t.status === 'published');
  }, [tests, currentTeacher.id]);

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const viewingTest = publishedTests.find((t) => t.id === selectedTestId) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Published Assessment Archives
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Historical record of verified exam results currently visible on parent and student portals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedTests.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            No published assessments found. Create and publish an assessment from the Tests & Grading tab.
          </div>
        ) : (
          publishedTests.map((t) => {
            const cls = classes.find((c) => c.id === t.classId);
            const subj = subjects.find((s) => s.id === t.subjectId);
            const avg =
              t.marks.length > 0
                ? Math.round(t.marks.reduce((sum, m) => sum + m.percentage, 0) / t.marks.length)
                : 0;

            return (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-mono">{formatDate(t.date)}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded font-semibold text-[10px] uppercase">
                      Live / Published
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {t.title}
                  </h3>

                  <div className="mt-2 text-xs text-slate-500">
                    {cls?.name} · {subj?.name}
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Candidates</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.marks.length} Students
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Class Average</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {avg}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedTestId(t.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Score Sheet</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Score Sheet Modal */}
      {viewingTest && (
        <Modal
          isOpen={!!viewingTest}
          onClose={() => setSelectedTestId(null)}
          title={viewingTest.title}
          description="Detailed Performance Ledger"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Roll #</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-right">Percentage</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Remarks</th>
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
