import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { Building2, Users, Eye, Phone, Calendar } from 'lucide-react';

export const TeacherClassesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teachers, classes, subjects, students } = useApp();

  const currentTeacher = teachers.find(
    (t) => t.id === currentUser?.linkedEntityId || t.email === currentUser?.email
  ) || teachers[4];

  const [selectedClassId, setSelectedClassId] = useState(currentTeacher.assignments[0]?.classId || classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(currentTeacher.assignments[0]?.sectionId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const cohortStudents = useMemo(() => {
    return students.filter((s) => {
      const matchCohort = s.classId === selectedClassId && (!selectedSectionId || s.sectionId === selectedSectionId);
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.includes(searchTerm);
      return matchCohort && matchSearch && s.status === 'active';
    });
  }, [students, selectedClassId, selectedSectionId, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          My Teaching Cohorts
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View assigned class rosters, student demographic details, and guardian contacts.
        </p>
      </div>

      {/* Cohort Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {currentTeacher.assignments.map((a, i) => {
          const cls = classes.find((c) => c.id === a.classId);
          const sec = cls?.sections.find((s) => s.id === a.sectionId);
          const isSelected = selectedClassId === a.classId && selectedSectionId === a.sectionId;

          return (
            <button
              key={i}
              onClick={() => {
                setSelectedClassId(a.classId);
                setSelectedSectionId(a.sectionId);
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cls?.name} — Section {sec?.name}
            </button>
          );
        })}
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search student by name, roll #, or admission #..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cohortStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                cohortStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {std.rollNo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {std.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{std.admissionNo}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div>{std.guardianName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{std.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatDate(std.dob)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingStudent(std)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title={viewingStudent.fullName}
          description={`Admission No: ${viewingStudent.admissionNo}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-2">
              <div>
                <span className="text-slate-400">Roll Number: </span>
                <span className="font-mono font-semibold">{viewingStudent.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400">Date of Birth: </span>
                <span className="font-mono">{formatDate(viewingStudent.dob)}</span>
              </div>
              <div>
                <span className="text-slate-400">Blood Group: </span>
                <span>{viewingStudent.bloodGroup || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400">Guardian Name: </span>
                <span className="font-medium">{viewingStudent.guardianName}</span>
              </div>
              <div>
                <span className="text-slate-400">Guardian Phone: </span>
                <span className="font-mono">{viewingStudent.guardianPhone}</span>
              </div>
              <div>
                <span className="text-slate-400">Residential Address: </span>
                <span>{viewingStudent.address}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
