import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { formatDate, exportToCSV } from '../../utils/formatters';
import {
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  Building2,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
} from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const { teachers, subjects, classes, addTeacher, updateTeacher, deleteTeacher } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: '',
    joiningDate: new Date().toISOString().split('T')[0],
    subjectIds: [] as string[],
    assignments: [] as { classId: string; sectionId: string }[],
    status: 'active' as 'active' | 'inactive',
  });

  const openAddModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '+92 300 1234567',
      qualification: 'M.Sc. Mathematics',
      joiningDate: new Date().toISOString().split('T')[0],
      subjectIds: [subjects[0]?.id || ''],
      assignments: [{ classId: classes[0]?.id || '', sectionId: classes[0]?.sections[0]?.id || '' }],
      status: 'active',
    });
    setIsAddOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      joiningDate: teacher.joiningDate,
      subjectIds: teacher.subjectIds,
      assignments: teacher.assignments,
      status: teacher.status,
    });
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
      setEditingTeacher(null);
    } else {
      addTeacher(formData);
      setIsAddOpen(false);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredTeachers.map((t) => ({
      'Employee ID': t.employeeId,
      Name: t.fullName,
      Email: t.email,
      Phone: t.phone,
      Qualification: t.qualification,
      'Joining Date': t.joiningDate,
      Status: t.status,
    }));
    exportToCSV('Faculty_Members', rows);
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubj =
        selectedSubjectId === 'all' || t.subjectIds.includes(selectedSubjectId);

      return matchesSearch && matchesSubj;
    });
  }, [teachers, searchTerm, selectedSubjectId]);

  const totalPages = Math.ceil(filteredTeachers.length / pageSize);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Faculty & Teachers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage instructional staff, subject specialization, and timetable class assignments.
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
            searchPlaceholder="Search faculty by name, email, or ID..."
            onExport={handleExportCSV}
            onAdd={openAddModal}
            addLabel="Add Faculty Member"
            filterComponent={
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Assigned Classes</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTeachers.map((t) => {
                const assignedSubjects = subjects.filter((s) => t.subjectIds.includes(s.id));
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {t.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {t.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">{t.qualification}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {t.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedSubjects.map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] text-slate-600 dark:text-slate-300"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {t.assignments.map((a, i) => {
                          const cls = classes.find((c) => c.id === a.classId);
                          const sec = cls?.sections.find((s) => s.id === a.sectionId);
                          return (
                            <span key={i} className="text-slate-600 dark:text-slate-300">
                              {cls?.name} ({sec?.name}){i < t.assignments.length - 1 ? ' · ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div>{t.email}</div>
                      <div className="text-[10px] font-mono">{t.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          t.status === 'active'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span className="capitalize">{t.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingTeacher(t)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTeacherId(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete"
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
          totalItems={filteredTeachers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={isAddOpen || !!editingTeacher}
        onClose={() => {
          setIsAddOpen(false);
          setEditingTeacher(null);
        }}
        title={editingTeacher ? 'Edit Faculty Profile' : 'Add New Teacher'}
        description="Enter instructor credentials and subject assignments"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium mb-1">Qualifications *</label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. M.Sc. Physics, Quaid-e-Azam University"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Joining Date</label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Specialized Subjects</label>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
              {subjects.map((subj) => (
                <label key={subj.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjectIds.includes(subj.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, subjectIds: [...formData.subjectIds, subj.id] });
                      } else {
                        setFormData({
                          ...formData,
                          subjectIds: formData.subjectIds.filter((id) => id !== subj.id),
                        });
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>{subj.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingTeacher(null);
              }}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* View Teacher Details Modal */}
      {viewingTeacher && (
        <Modal
          isOpen={!!viewingTeacher}
          onClose={() => setViewingTeacher(null)}
          title={viewingTeacher.fullName}
          description={`Employee ID: ${viewingTeacher.employeeId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
              <div>
                <span className="text-slate-400">Email: </span>
                <span className="font-medium">{viewingTeacher.email}</span>
              </div>
              <div>
                <span className="text-slate-400">Phone: </span>
                <span className="font-mono">{viewingTeacher.phone}</span>
              </div>
              <div>
                <span className="text-slate-400">Qualification: </span>
                <span>{viewingTeacher.qualification}</span>
              </div>
              <div>
                <span className="text-slate-400">Joining Date: </span>
                <span className="font-mono">{formatDate(viewingTeacher.joiningDate)}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold block mb-1">Assigned Classes & Sections:</span>
              <div className="space-y-1">
                {viewingTeacher.assignments.map((a, i) => {
                  const cls = classes.find((c) => c.id === a.classId);
                  const sec = cls?.sections.find((s) => s.id === a.sectionId);
                  return (
                    <div
                      key={i}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {cls?.name}
                      </span>
                      <span className="text-slate-500">Section {sec?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingTeacherId}
        onClose={() => setDeletingTeacherId(null)}
        onConfirm={() => {
          if (deletingTeacherId) deleteTeacher(deletingTeacherId);
          setDeletingTeacherId(null);
        }}
        title="Remove Faculty Member?"
        message="Are you sure you want to remove this instructor? Their assigned timetable will need reassignment."
        confirmLabel="Remove"
        isDestructive={true}
      />
    </div>
  );
};
