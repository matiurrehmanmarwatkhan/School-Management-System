import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { UserCheck, Save, Mail, Phone, GraduationCap, Building2, BookOpen } from 'lucide-react';

export const TeacherProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { teachers, classes, subjects, updateTeacher, addToast } = useApp();

  const currentTeacher = teachers.find(
    (t) => t.id === currentUser?.linkedEntityId || t.email === currentUser?.email
  ) || teachers[4];

  const [phone, setPhone] = useState(currentTeacher.phone);
  const [email, setEmail] = useState(currentTeacher.email);

  const assignedSubjects = subjects.filter((s) => currentTeacher.subjectIds.includes(s.id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacher(currentTeacher.id, { phone, email });
    updateCurrentUserProfile({ phone, email });
    addToast('success', 'Profile contact details updated successfully');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Faculty Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View official instructional accreditation and update permitted contact information.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentTeacher.firstName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentTeacher.fullName}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Employee ID: <span className="font-mono font-medium">{currentTeacher.employeeId}</span> · Joined: {formatDate(currentTeacher.joiningDate)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              {currentTeacher.qualification}
            </div>
          </div>
        </div>

        {/* Assigned Curriculum & Timetable */}
        <div className="py-5 border-b border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Designated Subjects
            </span>
            <div className="flex flex-wrap gap-1.5">
              {assignedSubjects.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-md font-medium"
                >
                  {s.name} ({s.code})
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Assigned Classes & Sections
            </span>
            <div className="space-y-1">
              {currentTeacher.assignments.map((a, i) => {
                const cls = classes.find((c) => c.id === a.classId);
                const sec = cls?.sections.find((s) => s.id === a.sectionId);
                return (
                  <div key={i} className="text-slate-700 dark:text-slate-300">
                    • {cls?.name} — Section {sec?.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permitted Contact Edits */}
        <form onSubmit={handleSave} className="pt-5 space-y-4 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
            Edit Permitted Contact Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Contact Info</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
