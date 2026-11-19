import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { Award, Filter, Calendar, BookOpen } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const ParentResultsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { parents, students, classes, subjects, tests } = useApp();

  const currentParent = parents.find(
    (p) => p.id === currentUser?.linkedEntityId || p.email === currentUser?.email
  ) || parents[0];

  const linkedStudents = students.filter((s) => currentParent.linkedStudentIds.includes(s.id));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  const activeStudent = linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];

  // STRICT REQUIREMENT: Only PUBLISHED tests. Drafts MUST NEVER appear.
  const publishedResults = useMemo(() => {
    return tests
      .filter((t) => t.status === 'published' && t.marks.some((m) => m.studentId === activeStudent?.id))
      .filter((t) => (selectedSubjectId === 'all' ? true : t.subjectId === selectedSubjectId))
      .map((t) => {
        const mark = t.marks.find((m) => m.studentId === activeStudent?.id)!;
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
  }, [tests, activeStudent, selectedSubjectId, subjects]);

  // Chart data
  const chartData = useMemo(() => {
    return [...publishedResults].reverse().map((r) => ({
      name: r.title.length > 18 ? r.title.substring(0, 16) + '...' : r.title,
      score: r.percentage,
    }));
  }, [publishedResults]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Official Examination & Test Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified academic evaluations certified and released by the school faculty.
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

      {/* Performance Progression Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Percentage Trend Across Assessments ({activeStudent?.fullName})
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Obtained Percentage']} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Published Report Cards for {activeStudent?.fullName}
          </h3>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4 text-right">Marks Obtained</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {publishedResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No published results found. Any in-progress drafts remain confidential until faculty approval.
                  </td>
                </tr>
              ) : (
                publishedResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {res.title}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {res.subjectName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatDate(res.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {res.marksObtained} / {res.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">
                      {res.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {res.remarks || 'Satisfactory effort'}
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
