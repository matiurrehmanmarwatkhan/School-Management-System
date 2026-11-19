import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const { subjects, classes, teachers, addSubject, updateSubject, deleteSubject } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [classIds, setClassIds] = useState<string[]>([]);
  const [teacherIds, setTeacherIds] = useState<string[]>([]);

  const openAdd = () => {
    setCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setClassIds(classes.map((c) => c.id));
    setTeacherIds([]);
    setIsAddOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingSubject(s);
    setCode(s.code);
    setName(s.name);
    setClassIds(s.classIds);
    setTeacherIds(s.teacherIds);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, { code, name, classIds, teacherIds });
      setEditingSubject(null);
    } else {
      addSubject({ code, name, classIds, teacherIds });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Subject Curriculum & Assignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure academic courses, grade allocations, and designated teachers.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => {
          const assignedTeachers = teachers.filter((t) => sub.teacherIds.includes(t.id));
          const assignedClasses = classes.filter((c) => sub.classIds.includes(c.id));

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {sub.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {sub.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(sub)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubjectId(sub.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs mt-4">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Taught In Classes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedClasses.length === 0 ? (
                        <span className="text-slate-400">None assigned</span>
                      ) : (
                        assignedClasses.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded text-[11px]"
                          >
                            {c.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Assigned Instructors:
                    </span>
                    <div className="space-y-1">
                      {assignedTeachers.length === 0 ? (
                        <span className="text-slate-400">No teacher assigned</span>
                      ) : (
                        assignedTeachers.map((t) => (
                          <div key={t.id} className="text-slate-800 dark:text-slate-200">
                            • {t.fullName}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen || !!editingSubject}
        onClose={() => {
          setIsAddOpen(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Subject Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. BIO-201"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biology & Genetics"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Applicable Classes</label>
            <div className="max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
              {classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={classIds.includes(cls.id)}
                    onChange={(e) => {
                      if (e.target.checked) setClassIds([...classIds, cls.id]);
                      else setClassIds(classIds.filter((id) => id !== cls.id));
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>{cls.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Designated Teachers</label>
            <div className="max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
              {teachers.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teacherIds.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) setTeacherIds([...teacherIds, t.id]);
                      else setTeacherIds(teacherIds.filter((id) => id !== t.id));
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>
                    {t.fullName} ({t.employeeId})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingSubject(null);
              }}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingSubjectId}
        onClose={() => setDeletingSubjectId(null)}
        onConfirm={() => {
          if (deletingSubjectId) deleteSubject(deletingSubjectId);
          setDeletingSubjectId(null);
        }}
        title="Delete Subject?"
        message="Are you sure you want to remove this subject curriculum?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
