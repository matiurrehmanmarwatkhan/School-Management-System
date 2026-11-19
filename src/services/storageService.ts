import {
  AcademicSession,
  AttendanceRecord,
  ClassItem,
  FeeRecord,
  Notice,
  Parent,
  PaymentTransaction,
  SchoolSettings,
  Student,
  Subject,
  Teacher,
  Test,
  User,
} from '../types';
import {
  initialAttendance,
  initialClasses,
  initialFeeRecords,
  initialNotices,
  initialParents,
  initialPaymentTransactions,
  initialSessions,
  initialSettings,
  initialStudents,
  initialSubjects,
  initialTeachers,
  initialTests,
  initialUsers,
} from '../data/seedData';

const KEYS = {
  SETTINGS: 'edumanage_settings_v1',
  SESSIONS: 'edumanage_sessions_v1',
  CLASSES: 'edumanage_classes_v1',
  SUBJECTS: 'edumanage_subjects_v1',
  TEACHERS: 'edumanage_teachers_v1',
  PARENTS: 'edumanage_parents_v1',
  STUDENTS: 'edumanage_students_v1',
  ATTENDANCE: 'edumanage_attendance_v1',
  FEES: 'edumanage_fees_v1',
  PAYMENTS: 'edumanage_payments_v1',
  TESTS: 'edumanage_tests_v1',
  NOTICES: 'edumanage_notices_v1',
  USERS: 'edumanage_users_v1',
  INITIALIZED: 'edumanage_initialized_v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const storageService = {
  initializeIfEmpty: () => {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      storageService.resetToSeedData();
    }
  },

  resetToSeedData: () => {
    save(KEYS.SETTINGS, initialSettings);
    save(KEYS.SESSIONS, initialSessions);
    save(KEYS.CLASSES, initialClasses);
    save(KEYS.SUBJECTS, initialSubjects);
    save(KEYS.TEACHERS, initialTeachers);
    save(KEYS.PARENTS, initialParents);
    save(KEYS.STUDENTS, initialStudents);
    save(KEYS.ATTENDANCE, initialAttendance);
    save(KEYS.FEES, initialFeeRecords);
    save(KEYS.PAYMENTS, initialPaymentTransactions);
    save(KEYS.TESTS, initialTests);
    save(KEYS.NOTICES, initialNotices);
    save(KEYS.USERS, initialUsers);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  },

  // Settings
  getSettings: (): SchoolSettings => load(KEYS.SETTINGS, initialSettings),
  saveSettings: (settings: SchoolSettings) => save(KEYS.SETTINGS, settings),

  // Sessions
  getSessions: (): AcademicSession[] => load(KEYS.SESSIONS, initialSessions),
  saveSessions: (sessions: AcademicSession[]) => save(KEYS.SESSIONS, sessions),

  // Classes
  getClasses: (): ClassItem[] => load(KEYS.CLASSES, initialClasses),
  saveClasses: (classes: ClassItem[]) => save(KEYS.CLASSES, classes),

  // Subjects
  getSubjects: (): Subject[] => load(KEYS.SUBJECTS, initialSubjects),
  saveSubjects: (subjects: Subject[]) => save(KEYS.SUBJECTS, subjects),

  // Teachers
  getTeachers: (): Teacher[] => load(KEYS.TEACHERS, initialTeachers),
  saveTeachers: (teachers: Teacher[]) => save(KEYS.TEACHERS, teachers),

  // Parents
  getParents: (): Parent[] => load(KEYS.PARENTS, initialParents),
  saveParents: (parents: Parent[]) => save(KEYS.PARENTS, parents),

  // Students
  getStudents: (): Student[] => load(KEYS.STUDENTS, initialStudents),
  saveStudents: (students: Student[]) => save(KEYS.STUDENTS, students),

  // Attendance
  getAttendance: (): AttendanceRecord[] => load(KEYS.ATTENDANCE, initialAttendance),
  saveAttendance: (records: AttendanceRecord[]) => save(KEYS.ATTENDANCE, records),

  // Fees
  getFees: (): FeeRecord[] => load(KEYS.FEES, initialFeeRecords),
  saveFees: (fees: FeeRecord[]) => save(KEYS.FEES, fees),

  // Payments / Transactions
  getPayments: (): PaymentTransaction[] => load(KEYS.PAYMENTS, initialPaymentTransactions),
  savePayments: (payments: PaymentTransaction[]) => save(KEYS.PAYMENTS, payments),

  // Tests
  getTests: (): Test[] => load(KEYS.TESTS, initialTests),
  saveTests: (tests: Test[]) => save(KEYS.TESTS, tests),

  // Notices
  getNotices: (): Notice[] => load(KEYS.NOTICES, initialNotices),
  saveNotices: (notices: Notice[]) => save(KEYS.NOTICES, notices),

  // Users
  getUsers: (): User[] => load(KEYS.USERS, initialUsers),
  saveUsers: (users: User[]) => save(KEYS.USERS, users),
};
