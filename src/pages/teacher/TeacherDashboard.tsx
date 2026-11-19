import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  BookOpen,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  PlusCircle,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { teachers, classes, subjects, students, attendance, tests } = useApp();
  const navigate = useNavigate();

  // Find the active teacher record
  const currentTeacher = teachers.find(
    (t) => t.id === currentUser?.linkedEntityId || t.email === currentUser?.email
  ) || teachers[4]; // Default to Mr. Tariq Mahmood

  // Assigned classes and sections
  const assignedClassIds = currentTeacher.assignments.map((a) => a.classId);
  const assignedSubjects = subjects.filter((s) => currentTeacher.subjectIds.includes(s.id));

  // Students taught
  const assignedStudents = students.filter(
    (s) =>
      s.status === 'active' &&
      currentTeacher.assignments.some(
        (a) => a.classId === s.classId && a.sectionId === s.sectionId
      )
  );

  // Today's attendance for teacher's classes
  const today = '2026-10-16';
  const todayAttendance = attendance.filter(
    (a) => a.date === today && assignedClassIds.includes(a.classId)
  );
  const presentCount = todayAttendance.filter(
    (a) => a.status === 'present' || a.status === 'late'
  ).length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 96;

  // Teacher's tests
  const myTests = tests.filter((t) => t.teacherId === currentTeacher.id);
  const draftTests = myTests.filter((t) => t.status === 'draft');
  const publishedTests = myTests.filter((t) => t.status === 'published');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {currentTeacher.fullName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Faculty ID: <span className="font-mono font-medium">{currentTeacher.employeeId}</span> · {currentTeacher.qualification}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => navigate('/teacher/tests')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={currentTeacher.assignments.length}
          subtitle="Timetable lecture slots"
          icon={Building2}
          highlightColor="blue"
        />
        <StatCard
          title="Specialized Subjects"
          value={assignedSubjects.length}
          subtitle={assignedSubjects.map((s) => s.name).join(', ')}
          icon={BookOpen}
          highlightColor="indigo"
        />
        <StatCard
          title="Total Students Taught"
          value={assignedStudents.length}
          subtitle="Enrolled in your sections"
          icon={Users}
          highlightColor="emerald"
        />
        <StatCard
          title="Today's Class Attendance"
          value={`${attendanceRate}%`}
          subtitle="Across assigned cohorts"
          icon={CheckCircle2}
          highlightColor="amber"
        />
      </div>

      {/* Assigned Classes Quick Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              My Active Class Cohorts
            </h3>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>View Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {currentTeacher.assignments.map((a, i) => {
              const cls = classes.find((c) => c.id === a.classId);
              const sec = cls?.sections.find((s) => s.id === a.sectionId);
              const count = students.filter(
                (s) => s.classId === a.classId && s.sectionId === a.sectionId && s.status === 'active'
              ).length;

              return (
                <div
                  key={i}
                  className="p-3.5 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {cls?.name} — Section {sec?.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Curriculum: {assignedSubjects.map((s) => s.name).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {count} Students
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tests / Grading Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Assessments & Grading
            </h3>
            <button
              onClick={() => navigate('/teacher/tests')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>All Tests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {myTests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No assessments created yet. Click "Create Assessment" to start.
              </div>
            ) : (
              myTests.slice(0, 4).map((t) => {
                const cls = classes.find((c) => c.id === t.classId);
                const subj = subjects.find((s) => s.id === t.subjectId);
                return (
                  <div
                    key={t.id}
                    className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {cls?.name} · {subj?.name} · Date: {formatDate(t.date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge type="test" value={t.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
