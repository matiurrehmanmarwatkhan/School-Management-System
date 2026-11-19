import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { Award, BookOpen, Calendar } from 'lucide-react';

export const StudentResultsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, subjects, tests } = useApp();

  const currentStudent = students.find(
    (s) => s.id === currentUser?.linkedEntityId || s.email === currentUser?.email
  ) || students[0];

  // Strictly PUBLISHED tests only
  const myResults = useMemo(() => {
    return tests
      .filter((t) => t.status === 'published' && t.marks.some((m) => m.studentId === currentStudent.id))
      .map((t) => {
        const mark = t.marks.find((m) => m.studentId === currentStudent.id)!;
        const subj = subjects.find((s) => s.id === t.subjectId);
        return {
          id: t.id,
          title: t.title,
          subjectName: subj?.name || 'Subject',
          date: t.date,
          totalMarks: t.totalMarks,
          marksObtained: mark.marksObtained,
          percentage: mark.percentage,
          grade: mark.grade,
          remarks: mark.remarks,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [tests, currentStudent.id, subjects]);

  const overallAvg =
    myResults.length > 0
      ? Math.round((myResults.reduce((sum, r) => sum + r.percentage, 0) / myResults.length) * 10) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Examination & Test Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official released report cards, mark sheets, and instructor feedback.
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 text-xs shadow-xs">
          <span className="text-slate-500">Cumulative GPA Average:</span>
          <span className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            {overallAvg}%
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Assessment Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4 text-right">Marks Scored</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Instructor Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No published results available yet. Check back once examinations are graded and published.
                  </td>
                </tr>
              ) : (
                myResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {r.title}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {r.subjectName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {r.marksObtained} / {r.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                      {r.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {r.remarks || 'Satisfactory'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
