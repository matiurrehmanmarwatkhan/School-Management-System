import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Parent } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { exportToCSV } from '../../utils/formatters';
import {
  Users,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Briefcase,
} from 'lucide-react';

export const ParentsPage: React.FC = () => {
  const { parents, students, classes, addParent, updateParent, deleteParent } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [viewingParent, setViewingParent] = useState<Parent | null>(null);
  const [deletingParentId, setDeletingParentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    address: '',
    linkedStudentIds: [] as string[],
  });

  const openAddModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '+92 300 0000000',
      occupation: 'Government Official',
      address: 'Islamabad, Pakistan',
      linkedStudentIds: [],
    });
    setIsAddOpen(true);
  };

  const openEditModal = (parent: Parent) => {
    setEditingParent(parent);
    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phone: parent.phone,
      occupation: parent.occupation,
      address: parent.address,
      linkedStudentIds: parent.linkedStudentIds,
    });
  };

  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParent) {
      updateParent(editingParent.id, formData);
      setEditingParent(null);
    } else {
      addParent(formData);
      setIsAddOpen(false);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredParents.map((p) => {
      const childrenNames = p.linkedStudentIds
        .map((id) => students.find((s) => s.id === id)?.fullName)
        .filter(Boolean)
        .join('; ');
      return {
        Name: p.fullName,
        Email: p.email,
        Phone: p.phone,
        Occupation: p.occupation,
        Address: p.address,
        'Linked Children': childrenNames,
      };
    });
    exportToCSV('Parents_Directory', rows);
  };

  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      const matchName = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEmail = p.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = p.phone.includes(searchTerm);
      const matchChild = p.linkedStudentIds.some((id) => {
        const std = students.find((s) => s.id === id);
        return std?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      return matchName || matchEmail || matchPhone || matchChild;
    });
  }, [parents, students, searchTerm]);

  const totalPages = Math.ceil(filteredParents.length / pageSize);
  const paginatedParents = filteredParents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Parents & Guardians
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage guardian profiles and linkages to enrolled children.
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
            searchPlaceholder="Search parents by name, child name, or phone..."
            onExport={handleExportCSV}
            onAdd={openAddModal}
            addLabel="Add Parent / Guardian"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Guardian Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Occupation</th>
                <th className="py-3 px-4">Linked Student(s)</th>
                <th className="py-3 px-4">Residential Address</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedParents.map((p) => {
                const linkedStudents = students.filter((s) => p.linkedStudentIds.includes(s.id));
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {p.firstName.charAt(0)}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {p.fullName}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200">{p.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {p.occupation}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {linkedStudents.length === 0 ? (
                          <span className="text-slate-400">No students linked</span>
                        ) : (
                          linkedStudents.map((s) => {
                            const cls = classes.find((c) => c.id === s.classId);
                            return (
                              <div
                                key={s.id}
                                className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                              >
                                <span>{s.fullName}</span>
                                <span className="text-[10px] text-slate-400">
                                  ({cls?.name || 'Class'})
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                      {p.address}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingParent(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingParentId(p.id)}
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
          totalItems={filteredParents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Parent Modal */}
      <Modal
        isOpen={isAddOpen || !!editingParent}
        onClose={() => {
          setIsAddOpen(false);
          setEditingParent(null);
        }}
        title={editingParent ? 'Edit Guardian Details' : 'Add New Parent'}
        description="Configure guardian personal details and link to students"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveParent} className="space-y-4 text-xs">
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
              <label className="block font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium mb-1">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium mb-1">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Link Children (Students)</label>
            <div className="max-h-40 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
              {students.map((std) => (
                <label key={std.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={formData.linkedStudentIds.includes(std.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          linkedStudentIds: [...formData.linkedStudentIds, std.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          linkedStudentIds: formData.linkedStudentIds.filter((id) => id !== std.id),
                        });
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>
                    {std.fullName} ({std.admissionNo})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingParent(null);
              }}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Details
            </button>
          </div>
        </form>
      </Modal>

      {/* View Parent Modal */}
      {viewingParent && (
        <Modal
          isOpen={!!viewingParent}
          onClose={() => setViewingParent(null)}
          title={viewingParent.fullName}
          description="Guardian Profile"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
              <div>
                <span className="text-slate-400">Email: </span>
                <span className="font-medium">{viewingParent.email}</span>
              </div>
              <div>
                <span className="text-slate-400">Phone: </span>
                <span className="font-mono">{viewingParent.phone}</span>
              </div>
              <div>
                <span className="text-slate-400">Occupation: </span>
                <span>{viewingParent.occupation}</span>
              </div>
              <div>
                <span className="text-slate-400">Address: </span>
                <span>{viewingParent.address}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold block mb-1">Enrolled Children:</span>
              <div className="space-y-1">
                {viewingParent.linkedStudentIds.map((id) => {
                  const std = students.find((s) => s.id === id);
                  const cls = classes.find((c) => c.id === std?.classId);
                  return (
                    <div
                      key={id}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {std?.fullName}
                      </span>
                      <span className="text-slate-500">
                        {cls?.name} (Roll #{std?.rollNo})
                      </span>
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
        isOpen={!!deletingParentId}
        onClose={() => setDeletingParentId(null)}
        onConfirm={() => {
          if (deletingParentId) deleteParent(deletingParentId);
          setDeletingParentId(null);
        }}
        title="Delete Guardian Record?"
        message="Are you sure you want to remove this parent profile?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
