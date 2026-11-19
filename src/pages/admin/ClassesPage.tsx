import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { formatCurrency } from '../../utils/formatters';
import { Building2, Plus, Edit2, Trash2, Users, UserCheck } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const { classes, teachers, students, settings, addClass, updateClass, deleteClass, addSection } = useApp();

  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  // Add section modal
  const [addingSectionForClass, setAddingSectionForClass] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCapacity, setNewSectionCapacity] = useState(35);

  // Form State for Class
  const [name, setName] = useState('');
  const [numericLevel, setNumericLevel] = useState(1);
  const [classTeacherId, setClassTeacherId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(7000);
  const [sectionsInput, setSectionsInput] = useState('A, B');

  const openAddClass = () => {
    setName(`Class ${classes.length + 6}`);
    setNumericLevel(classes.length + 6);
    setClassTeacherId(teachers[0]?.id || '');
    setMonthlyFee(7500);
    setSectionsInput('A, B');
    setIsAddClassOpen(true);
  };

  const openEditClass = (c: ClassItem) => {
    setEditingClass(c);
    setName(c.name);
    setNumericLevel(c.numericLevel);
    setClassTeacherId(c.classTeacherId || '');
    setMonthlyFee(c.monthlyFee || 7000);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, {
        name,
        numericLevel,
        classTeacherId,
        monthlyFee,
      });
      setEditingClass(null);
    } else {
      const sectionNames = sectionsInput
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      addClass(
        {
          name,
          numericLevel,
          classTeacherId,
          monthlyFee,
        },
        sectionNames.length ? sectionNames : ['A']
      );
      setIsAddClassOpen(false);
    }
  };

  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingSectionForClass || !newSectionName.trim()) return;
    addSection(addingSectionForClass, newSectionName.trim(), newSectionCapacity);
    setAddingSectionForClass(null);
    setNewSectionName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Classes & Sections
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure academic grade levels, sections, assigned class teachers, and tuition fee structures.
          </p>
        </div>
        <button
          onClick={openAddClass}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classTeacher = teachers.find((t) => t.id === cls.classTeacherId);
          const totalClassStudents = students.filter((s) => s.classId === cls.id).length;

          return (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {cls.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Monthly Tuition: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(cls.monthlyFee, settings.currency)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditClass(cls)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Edit Class"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingClassId(cls.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Class Teacher:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {classTeacher ? classTeacher.fullName : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Enrolled:</span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {totalClassStudents} Students
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Sections ({cls.sections.length})</span>
                    <button
                      onClick={() => setAddingSectionForClass(cls.id)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {cls.sections.map((sec) => {
                      const sectionStudents = students.filter(
                        (s) => s.classId === cls.id && s.sectionId === sec.id
                      ).length;
                      return (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between px-3 py-2 border border-slate-100 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Section {sec.name}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {sectionStudents} / {sec.capacity} students
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isAddClassOpen || !!editingClass}
        onClose={() => {
          setIsAddClassOpen(false);
          setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class Structure' : 'Create New Class'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Class Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 11"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Grade Level Index (1-12)</label>
            <input
              type="number"
              required
              value={numericLevel}
              onChange={(e) => setNumericLevel(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Assigned Class Teacher</label>
            <select
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              <option value="">-- None / Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Monthly Tuition Fee (PKR) *</label>
            <input
              type="number"
              required
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
            />
          </div>

          {!editingClass && (
            <div>
              <label className="block font-medium mb-1">Initial Sections (Comma separated)</label>
              <input
                type="text"
                value={sectionsInput}
                onChange={(e) => setSectionsInput(e.target.value)}
                placeholder="A, B, C"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddClassOpen(false);
                setEditingClass(null);
              }}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Class
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={!!addingSectionForClass}
        onClose={() => setAddingSectionForClass(null)}
        title="Add New Section"
        maxWidth="sm"
      >
        <form onSubmit={handleAddSectionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Section Letter/Name *</label>
            <input
              type="text"
              required
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g. C"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg uppercase"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Seat Capacity</label>
            <input
              type="number"
              required
              value={newSectionCapacity}
              onChange={(e) => setNewSectionCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddingSectionForClass(null)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Add Section
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingClassId}
        onClose={() => setDeletingClassId(null)}
        onConfirm={() => {
          if (deletingClassId) deleteClass(deletingClassId);
          setDeletingClassId(null);
        }}
        title="Delete Class?"
        message="Are you sure you want to delete this class? Make sure no active students are allocated to it."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
