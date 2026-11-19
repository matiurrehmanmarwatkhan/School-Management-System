export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'accountant';

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  feeRecordId: string;
  studentId: string;
  classId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online Slip' | 'Other';
  referenceNo?: string;
  remarks?: string;
  accountantName: string;
  recordedAt: string;
  previousBalance: number;
  newBalance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  linkedEntityId?: string; // studentId for student, teacherId for teacher, parentId for parent
  phone?: string;
  status: 'active' | 'inactive';
}

export type StudentStatus = 'active' | 'inactive' | 'withdrawn';

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  classId: string;
  sectionId: string;
  sessionId: string;
  guardianId: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail?: string;
  address: string;
  bloodGroup?: string;
  admissionDate: string;
  status: StudentStatus;
  photo?: string;
}

export interface TeacherAssignment {
  classId: string;
  sectionId: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  joiningDate: string;
  subjectIds: string[];
  assignments: TeacherAssignment[];
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
  linkedStudentIds: string[];
  avatar?: string;
}

export interface SectionItem {
  id: string;
  name: string; // e.g., 'A', 'B'
  classId: string;
  capacity: number;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "Class 9", "Class 10"
  numericLevel: number;
  classTeacherId?: string;
  sections: SectionItem[];
  monthlyFee: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  classIds: string[];
  teacherIds: string[];
}

export interface AcademicSession {
  id: string;
  name: string; // "2025-2026", "2026-2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export type FeeStatus = 'paid' | 'unpaid' | 'partial' | 'overdue';

export interface FeeRecord {
  id: string;
  invoiceNo: string;
  studentId: string;
  classId: string;
  month: string; // e.g., "September 2026", "October 2026"
  year: number;
  amount: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  balance: number;
  status: FeeStatus;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online Slip';
  remarks?: string;
}

export interface StudentMark {
  studentId: string;
  marksObtained: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

export type TestStatus = 'draft' | 'published';

export interface Test {
  id: string;
  title: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  date: string;
  totalMarks: number;
  passingMarks: number;
  status: TestStatus;
  marks: StudentMark[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetRoles: UserRole[];
  category: 'General' | 'Exam' | 'Fee' | 'Holiday' | 'Event';
  date: string;
  authorName: string;
  isPinned?: boolean;
}

export interface SchoolSettings {
  name: string;
  motto: string;
  logoText: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  currentSessionId: string;
  principalName: string;
  theme: 'light' | 'dark';
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
