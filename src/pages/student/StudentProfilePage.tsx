import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { GraduationCap, Calendar, Phone, MapPin, UserCheck, Shield } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, classes, sessions } = useApp();

  const currentStudent = students.find(
    (s) => s.id === currentUser?.linkedEntityId || s.email === currentUser?.email
  ) || students[0];

  const currentClass = classes.find((c) => c.id === currentStudent.classId);
  const currentSection = currentClass?.sections.find((s) => s.id === currentStudent.sectionId);
  const session = sessions.find((s) => s.id === currentStudent.sessionId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Student Profile Card
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Official enrollment credentials and personal identification data.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
            {currentStudent.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentStudent.fullName}
              </h2>
              <StatusBadge type="student" value={currentStudent.status} />
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Admission No: {currentStudent.admissionNo} · Roll #{currentStudent.rollNo}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
              {currentClass?.name} — Section {currentSection?.name || 'A'}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[11px]">Academic Session</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {session?.name || '2026-2027'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Date of Birth</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {formatDate(currentStudent.dob)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Gender</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {currentStudent.gender}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Blood Group</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {currentStudent.bloodGroup || 'O+'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Admission Date</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {formatDate(currentStudent.admissionDate)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Official Status</span>
            <span className="font-semibold text-emerald-600">Active Regular Candidate</span>
          </div>
        </div>

        {/* Guardian & Contact */}
        <div className="pt-5 space-y-3 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
            Guardian & Emergency Contact Information
          </span>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Guardian Name:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {currentStudent.guardianName} ({currentStudent.guardianRelation})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency Phone:</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {currentStudent.guardianPhone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Residential Address:</span>
              <span className="text-slate-800 dark:text-slate-200">{currentStudent.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
