import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, StudentStatus } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { FeeReceiptModal } from '../../components/common/FeeReceiptModal';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  GraduationCap,
  Eye,
  Edit2,
  Trash2,
  ArrowUpRight,
  User,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Award,
  CreditCard,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const {
    students,
    classes,
    sessions,
    parents,
    fees,
    attendance,
    tests,
    settings,
    addStudent,
    updateStudent,
    deleteStudent,
    promoteStudents,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [selectedForPromotion, setSelectedForPromotion] = useState<string[]>([]);
  const [targetClassId, setTargetClassId] = useState('');
  const [targetSectionId, setTargetSectionId] = useState('');
  const [targetSessionId, setTargetSessionId] = useState('');

  // Active tab in profile view
  const [profileTab, setProfileTab] = useState<'overview' | 'attendance' | 'fees' | 'tests'>('overview');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '2010-01-01',
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    sessionId: settings.currentSessionId || sessions[0]?.id || '',
    guardianId: parents[0]?.id || '',
    guardianName: parents[0]?.fullName || '',
    guardianRelation: 'Father',
    guardianPhone: parents[0]?.phone || '',
    guardianEmail: parents[0]?.email || '',
    address: 'Islamabad, Pakistan',
    bloodGroup: 'B+',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'active' as StudentStatus,
    rollNo: '101',
  });

  const openAddModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      dob: '2010-01-01',
      classId: classes[0]?.id || '',
      sectionId: classes[0]?.sections[0]?.id || '',
      sessionId: settings.currentSessionId || sessions[0]?.id || '',
      guardianId: parents[0]?.id || '',
      guardianName: parents[0]?.fullName || '',
      guardianRelation: 'Father',
      guardianPhone: parents[0]?.phone || '',
      guardianEmail: parents[0]?.email || '',
      address: 'Sector F-10, Islamabad',
      bloodGroup: 'O+',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
      rollNo: String(students.length + 100),
    });
    setIsAddOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dob: student.dob,
      classId: student.classId,
      sectionId: student.sectionId,
      sessionId: student.sessionId,
      guardianId: student.guardianId,
      guardianName: student.guardianName,
      guardianRelation: student.guardianRelation,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail || '',
      address: student.address,
      bloodGroup: student.bloodGroup || 'B+',
      admissionDate: student.admissionDate,
      status: student.status,
      rollNo: student.rollNo,
    });
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setEditingStudent(null);
    } else {
      addStudent(formData);
      setIsAddOpen(false);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredStudents.map((s) => {
      const cls = classes.find((c) => c.id === s.classId);
      const sec = cls?.sections.find((x) => x.id === s.sectionId);
      return {
        'Admission No': s.admissionNo,
        'Roll No': s.rollNo,
        'Full Name': s.fullName,
        Gender: s.gender,
        DOB: s.dob,
        Class: cls?.name || '',
        Section: sec?.name || '',
        Guardian: s.guardianName,
        'Guardian Phone': s.guardianPhone,
        Status: s.status,
      };
    });
    exportToCSV('Student_Roster', rows);
  };

  const handleExecutePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassId || !targetSectionId || !targetSessionId || selectedForPromotion.length === 0) return;
    promoteStudents(selectedForPromotion, targetClassId, targetSectionId, targetSessionId);
    setIsPromoteOpen(false);
    setSelectedForPromotion([]);
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.includes(searchTerm) ||
        s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedClassId, selectedStatus]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selected student related data for Profile Modal
  const studentAttendance = useMemo(() => {
    if (!viewingStudent) return [];
    return attendance.filter((a) => a.studentId === viewingStudent.id);
  }, [viewingStudent, attendance]);

  const studentFees = useMemo(() => {
    if (!viewingStudent) return [];
    return fees.filter((f) => f.studentId === viewingStudent.id);
  }, [viewingStudent, fees]);

  const studentTests = useMemo(() => {
    if (!viewingStudent) return [];
    return tests
      .filter((t) => t.status === 'published' && t.marks.some((m) => m.studentId === viewingStudent.id))
      .map((t) => {
        const mark = t.marks.find((m) => m.studentId === viewingStudent.id)!;
        return {
          testTitle: t.title,
          date: t.date,
          totalMarks: t.totalMarks,
          marksObtained: mark.marksObtained,
          percentage: mark.percentage,
          grade: mark.grade,
          remarks: mark.remarks,
        };
      });
  }, [viewingStudent, tests]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student records, admission profiles, class allocations, and academic promotion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedForPromotion(paginatedStudents.map((s) => s.id));
              setTargetClassId(classes[1]?.id || classes[0]?.id || '');
              setTargetSectionId(classes[1]?.sections[0]?.id || classes[0]?.sections[0]?.id || '');
              setTargetSessionId(settings.currentSessionId || sessions[0]?.id || '');
              setIsPromoteOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            <span>Promote Class</span>
          </button>
        </div>
      </div>

      {/* Table & Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by student name, admission #, or guardian..."
            onExport={handleExportCSV}
            onAdd={openAddModal}
            addLabel="Enroll New Student"
            filterComponent={
              <div className="flex items-center gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            }
          />
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll / Adm #</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Guardian Details</th>
                <th className="py-3 px-4">Gender / DOB</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No students match the selected search criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((std) => {
                  const cls = classes.find((c) => c.id === std.classId);
                  const sec = cls?.sections.find((s) => s.id === std.sectionId);
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {std.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {std.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Enrolled: {formatDate(std.admissionDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          Roll #{std.rollNo}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{std.admissionNo}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {cls?.name} - Sec {sec?.name || 'A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {std.guardianName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{std.guardianPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div>{std.gender}</div>
                        <div className="text-[10px] font-mono text-slate-400">{formatDate(std.dob)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="student" value={std.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setViewingStudent(std);
                              setProfileTab('overview');
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                            title="View Complete Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(std)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(std.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddOpen || !!editingStudent}
        onClose={() => {
          setIsAddOpen(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
        description="Fill in all the required academic and personal information"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                placeholder="e.g. B+"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign Class *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => {
                  const newClassId = e.target.value;
                  const targetClass = classes.find((c) => c.id === newClassId);
                  setFormData({
                    ...formData,
                    classId: newClassId,
                    sectionId: targetClass?.sections[0]?.id || '',
                  });
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign Section *
              </label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              >
                {classes
                  .find((c) => c.id === formData.classId)
                  ?.sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Section {sec.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Guardian Contact Phone *
              </label>
              <input
                type="text"
                required
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Student Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingStudent(null);
              }}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Student Profile View Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title={viewingStudent.fullName}
          description={`Admission No: ${viewingStudent.admissionNo}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Profile Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(
                [
                  { id: 'overview', label: 'Overview' },
                  { id: 'attendance', label: 'Attendance History' },
                  { id: 'fees', label: 'Fee Ledgers' },
                  { id: 'tests', label: 'Assessment Results' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    profileTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {profileTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Academic Details
                    </span>
                    <div>
                      <span className="text-slate-400">Class: </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {classes.find((c) => c.id === viewingStudent.classId)?.name} (Section{' '}
                        {
                          classes
                            .find((c) => c.id === viewingStudent.classId)
                            ?.sections.find((s) => s.id === viewingStudent.sectionId)?.name
                        }
                        )
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Roll Number: </span>
                      <span className="font-mono font-medium">{viewingStudent.rollNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Academic Session: </span>
                      <span>
                        {sessions.find((s) => s.id === viewingStudent.sessionId)?.name || 'Current'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Admission Date: </span>
                      <span className="font-mono">{formatDate(viewingStudent.admissionDate)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Personal Information
                    </span>
                    <div>
                      <span className="text-slate-400">Gender: </span>
                      <span>{viewingStudent.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Date of Birth: </span>
                      <span className="font-mono">{formatDate(viewingStudent.dob)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Blood Group: </span>
                      <span>{viewingStudent.bloodGroup || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status: </span>
                      <StatusBadge type="student" value={viewingStudent.status} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Guardian & Contact
                    </span>
                    <div>
                      <span className="text-slate-400">Guardian: </span>
                      <span className="font-medium">{viewingStudent.guardianName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Relation: </span>
                      <span>{viewingStudent.guardianRelation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone: </span>
                      <span className="font-mono">{viewingStudent.guardianPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Address: </span>
                      <span>{viewingStudent.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Attendance */}
            {profileTab === 'attendance' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          No attendance logs recorded for this student yet.
                        </td>
                      </tr>
                    ) : (
                      studentAttendance.map((rec) => (
                        <tr key={rec.id}>
                          <td className="py-2.5 px-3 font-mono">{formatDate(rec.date)}</td>
                          <td className="py-2.5 px-3">
                            <StatusBadge type="attendance" value={rec.status} />
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{rec.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Fees */}
            {profileTab === 'fees' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentFees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No fee records found for this student.
                        </td>
                      </tr>
                    ) : (
                      studentFees.map((fee) => (
                        <tr key={fee.id}>
                          <td className="py-2.5 px-3 font-mono">{fee.invoiceNo}</td>
                          <td className="py-2.5 px-3">{fee.month}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {formatCurrency(fee.netAmount, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600">
                            {formatCurrency(fee.paidAmount, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-600">
                            {formatCurrency(fee.balance, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusBadge type="fee" value={fee.status} />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedReceipt(fee)}
                              className="text-blue-600 hover:underline"
                            >
                              Print
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Tests */}
            {profileTab === 'tests' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Assessment Title</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                      <th className="py-2.5 px-3 text-right">Percentage</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentTests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No published test scores recorded yet.
                        </td>
                      </tr>
                    ) : (
                      studentTests.map((t, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {t.testTitle}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{formatDate(t.date)}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {t.marksObtained} / {t.totalMarks}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">
                            {t.percentage}%
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{t.grade}</td>
                          <td className="py-2.5 px-3 text-slate-500">{t.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Promotion Workflow Modal */}
      <Modal
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        title="Promote Students to Next Grade"
        description="Demo workflow to batch promote students to the next class and academic session"
        maxWidth="lg"
      >
        <form onSubmit={handleExecutePromotion} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Target Class
            </label>
            <select
              value={targetClassId}
              onChange={(e) => {
                setTargetClassId(e.target.value);
                const targetCls = classes.find((c) => c.id === e.target.value);
                setTargetSectionId(targetCls?.sections[0]?.id || '');
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Section
            </label>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              {classes
                .find((c) => c.id === targetClassId)
                ?.sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Academic Session
            </label>
            <select
              value={targetSessionId}
              onChange={(e) => setTargetSessionId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  Session {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-700 dark:text-blue-300">
            Selected <span className="font-semibold">{selectedForPromotion.length}</span> student(s) will be upgraded into the selected target class with persistence.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPromoteOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Execute Promotion
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Student Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingStudentId}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={() => {
          if (deletingStudentId) deleteStudent(deletingStudentId);
          setDeletingStudentId(null);
        }}
        title="Delete Student Record?"
        message="Are you sure you want to permanently delete this student? All linked records will be archived."
        confirmLabel="Delete"
        isDestructive={true}
      />

      {/* Fee Receipt Modal from student view */}
      <FeeReceiptModal feeRecord={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
