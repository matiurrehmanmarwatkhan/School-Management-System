import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { GraduationCap, Calendar, Phone, MapPin, Award } from 'lucide-react';

export const ParentChildrenPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { parents, students, classes, sessions } = useApp();

  const currentParent = parents.find(
    (p) => p.id === currentUser?.linkedEntityId || p.email === currentUser?.email
  ) || parents[0];

  const linkedStudents = students.filter((s) => currentParent.linkedStudentIds.includes(s.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          My Enrolled Children
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Student registration credentials and academic placement cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {linkedStudents.map((child) => {
          const cls = classes.find((c) => c.id === child.classId);
          const sec = cls?.sections.find((s) => s.id === child.sectionId);
          const sess = sessions.find((s) => s.id === child.sessionId);

          return (
            <div
              key={child.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      {child.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {child.fullName}
                      </h3>
                      <div className="text-xs text-slate-500 font-mono">
                        Admission No: {child.admissionNo}
                      </div>
                    </div>
                  </div>
                  <StatusBadge type="student" value={child.status} />
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class & Section:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cls?.name} (Section {sec?.name || 'A'})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class Roll Number:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {child.rollNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Academic Session:</span>
                    <span>{sess?.name || 'Current'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="font-mono">{formatDate(child.dob)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender & Blood Group:</span>
                    <span>
                      {child.gender} · {child.bloodGroup || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Admission Date:</span>
                    <span className="font-mono">{formatDate(child.admissionDate)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Registered under guardian: <span className="text-slate-600 dark:text-slate-300 font-medium">{currentParent.fullName}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
