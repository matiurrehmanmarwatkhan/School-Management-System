import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Test } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { formatDate, exportToCSV } from '../../utils/formatters';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Award,
  Send,
  Plus,
} from 'lucide-react';

export const TestsPage: React.FC = () => {
  const { tests, classes, subjects, teachers, students, publishTest, deleteTest } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [viewingTest, setViewingTest] = useState<Test | null>(null);
  const [publishingTestId, setPublishingTestId] = useState<string | null>(null);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const subj = subjects.find((s) => s.id === t.subjectId);
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subj?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassId === 'all' || t.classId === selectedClassId;
      const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [tests, subjects, searchTerm, selectedClassId, selectedStatus]);

  const totalPages = Math.ceil(filteredTests.length / pageSize);
  const paginatedTests = filteredTests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    const rows = filteredTests.map((t) => {
      const cls = classes.find((c) => c.id === t.classId);
      const subj = subjects.find((s) => s.id === t.subjectId);
      const tch = teachers.find((x) => x.id === t.teacherId);
      return {
        'Test Title': t.title,
        Class: cls?.name || '',
        Subject: subj?.name || '',
        Instructor: tch?.fullName || '',
        Date: t.date,
        'Total Marks': t.totalMarks,
        'Passing Marks': t.passingMarks,
        Status: t.status,
      };
    });
    exportToCSV('Academic_Assessments', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Assessments, Tests & Grading
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit mid-terms, monthly quizzes, student marks allocations, and publish results to portal.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={(v) => {
              setSearchTerm(v);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search assessments by title or subject..."
            onExport={handleExportCSV}
            filterComponent={
              <div className="flex items-center gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Conducted Date</th>
                <th className="py-3 px-4 text-right">Total Marks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTests.map((t) => {
                const cls = classes.find((c) => c.id === t.classId);
                const sec = cls?.sections.find((s) => s.id === t.sectionId);
                const subj = subjects.find((s) => s.id === t.subjectId);
                const tch = teachers.find((x) => x.id === t.teacherId);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Evaluated {t.marks.length} students
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {cls?.name} (Sec {sec?.name || 'A'})
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {subj?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {tch?.fullName || 'Assigned Staff'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {t.totalMarks}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="test" value={t.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.status === 'draft' && (
                          <button
                            onClick={() => setPublishingTestId(t.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish</span>
                          </button>
                        )}
                        <button
                          onClick={() => setViewingTest(t)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="View Grade Sheet"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTestId(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTests.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Grade Sheet Result Viewer Modal */}
      {viewingTest && (
        <Modal
          isOpen={!!viewingTest}
          onClose={() => setViewingTest(null)}
          title={viewingTest.title}
          description={`Class: ${classes.find((c) => c.id === viewingTest.classId)?.name} · Subject: ${subjects.find((s) => s.id === viewingTest.subjectId)?.name} · Total Marks: ${viewingTest.totalMarks}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div>
                <span className="text-slate-400">Date Conducted: </span>
                <span className="font-mono font-medium">{formatDate(viewingTest.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status: </span>
                <StatusBadge type="test" value={viewingTest.status} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Roll #</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-right">Marks Obtained</th>
                    <th className="py-2.5 px-3 text-right">Percentage</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {viewingTest.marks.map((m) => {
                    const student = students.find((s) => s.id === m.studentId);
                    return (
                      <tr key={m.studentId}>
                        <td className="py-2.5 px-3 font-mono font-medium">{student?.rollNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {student?.fullName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {m.marksObtained} / {viewingTest.totalMarks}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">
                          {m.percentage}%
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{m.grade}</td>
                        <td className="py-2.5 px-3 text-slate-500">{m.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation to Publish */}
      <ConfirmationDialog
        isOpen={!!publishingTestId}
        onClose={() => setPublishingTestId(null)}
        onConfirm={() => {
          if (publishingTestId) publishTest(publishingTestId);
          setPublishingTestId(null);
        }}
        title="Publish Test Results?"
        message="Once published, these test scores and teacher remarks will be immediately visible to students and their parents on their respective portals."
        confirmLabel="Publish Now"
        isDestructive={false}
      />

      {/* Confirmation to Delete */}
      <ConfirmationDialog
        isOpen={!!deletingTestId}
        onClose={() => setDeletingTestId(null)}
        onConfirm={() => {
          if (deletingTestId) deleteTest(deletingTestId);
          setDeletingTestId(null);
        }}
        title="Delete Assessment?"
        message="Are you sure you want to delete this test assessment and student grade records?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
