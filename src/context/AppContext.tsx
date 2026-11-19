import React, { createContext, useContext, useEffect, useState } from 'react';
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
  ToastItem,
  User,
} from '../types';
import { storageService } from '../services/storageService';

interface AppContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  sessions: AcademicSession[];
  currentSession: AcademicSession | undefined;
  switchCurrentSession: (sessionId: string) => void;
  addSession: (session: Omit<AcademicSession, 'id'>) => void;

  classes: ClassItem[];
  addClass: (cls: Omit<ClassItem, 'id' | 'sections'>, sectionNames?: string[]) => void;
  updateClass: (id: string, cls: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;
  addSection: (classId: string, sectionName: string, capacity?: number) => void;

  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subj: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id' | 'employeeId' | 'fullName'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  parents: Parent[];
  addParent: (parent: Omit<Parent, 'id' | 'fullName'>) => void;
  updateParent: (id: string, parent: Partial<Parent>) => void;
  deleteParent: (id: string) => void;

  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'admissionNo' | 'fullName'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  promoteStudents: (studentIds: string[], targetClassId: string, targetSectionId: string, targetSessionId: string) => void;

  attendance: AttendanceRecord[];
  saveAttendanceBatch: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  fees: FeeRecord[];
  recordFeePayment: (id: string, paidAmount: number, paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online Slip', remarks?: string) => void;
  generateMonthlyFees: (classId: string, month: string, year: number, dueDate: string) => number;
  addCustomFeeRecord: (record: Omit<FeeRecord, 'id' | 'invoiceNo'>) => void;

  payments: PaymentTransaction[];
  recordPaymentTransaction: (data: {
    feeRecordId: string;
    amount: number;
    paymentMethod: PaymentTransaction['paymentMethod'];
    paymentDate?: string;
    referenceNo?: string;
    remarks?: string;
    accountantName?: string;
  }) => { success: boolean; transaction?: PaymentTransaction; error?: string };

  tests: Test[];
  saveTest: (test: Omit<Test, 'id'> & { id?: string }) => void;
  publishTest: (id: string) => void;
  deleteTest: (id: string) => void;

  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  deleteNotice: (id: string) => void;

  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  resetAllData: () => void;

  toasts: ToastItem[];
  addToast: (type: ToastItem['type'], message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(() => storageService.getSettings());
  const [sessions, setSessions] = useState<AcademicSession[]>(() => storageService.getSessions());
  const [classes, setClasses] = useState<ClassItem[]>(() => storageService.getClasses());
  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.getSubjects());
  const [teachers, setTeachers] = useState<Teacher[]>(() => storageService.getTeachers());
  const [parents, setParents] = useState<Parent[]>(() => storageService.getParents());
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.getAttendance());
  const [fees, setFees] = useState<FeeRecord[]>(() => storageService.getFees());
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => storageService.getPayments());
  const [tests, setTests] = useState<Test[]>(() => storageService.getTests());
  const [notices, setNotices] = useState<Notice[]>(() => storageService.getNotices());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Apply dark mode class to HTML tag based on settings
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const addToast = (type: ToastItem['type'], message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storageService.saveSettings(updated);
      return updated;
    });
    addToast('success', 'School settings updated successfully');
  };

  // Sessions
  const currentSession = sessions.find((s) => s.id === settings.currentSessionId) || sessions.find((s) => s.isCurrent) || sessions[0];

  const switchCurrentSession = (sessionId: string) => {
    const updatedSessions = sessions.map((s) => ({
      ...s,
      isCurrent: s.id === sessionId,
    }));
    setSessions(updatedSessions);
    storageService.saveSessions(updatedSessions);

    setSettings((prev) => {
      const updated = { ...prev, currentSessionId: sessionId };
      storageService.saveSettings(updated);
      return updated;
    });
    addToast('info', `Active session changed to ${sessions.find((s) => s.id === sessionId)?.name || sessionId}`);
  };

  const addSession = (sessionData: Omit<AcademicSession, 'id'>) => {
    const newSession: AcademicSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    storageService.saveSessions(updated);
    addToast('success', `Academic session ${newSession.name} created`);
  };

  // Classes
  const addClass = (clsData: Omit<ClassItem, 'id' | 'sections'>, sectionNames: string[] = ['A']) => {
    const classId = `cls-${Date.now()}`;
    const sections = sectionNames.map((name, idx) => ({
      id: `sec-${Date.now()}-${idx}`,
      name,
      classId,
      capacity: 35,
    }));
    const newClass: ClassItem = {
      ...clsData,
      id: classId,
      sections,
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    storageService.saveClasses(updated);
    addToast('success', `Class ${newClass.name} created`);
  };

  const updateClass = (id: string, clsData: Partial<ClassItem>) => {
    const updated = classes.map((c) => (c.id === id ? { ...c, ...clsData } : c));
    setClasses(updated);
    storageService.saveClasses(updated);
    addToast('success', 'Class updated successfully');
  };

  const deleteClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    storageService.saveClasses(updated);
    addToast('info', 'Class removed');
  };

  const addSection = (classId: string, sectionName: string, capacity: number = 35) => {
    const updated = classes.map((c) => {
      if (c.id === classId) {
        const newSec = {
          id: `sec-${Date.now()}`,
          name: sectionName.toUpperCase(),
          classId,
          capacity,
        };
        return { ...c, sections: [...c.sections, newSec] };
      }
      return c;
    });
    setClasses(updated);
    storageService.saveClasses(updated);
    addToast('success', `Section ${sectionName.toUpperCase()} added`);
  };

  // Subjects
  const addSubject = (subjData: Omit<Subject, 'id'>) => {
    const newSubj: Subject = {
      ...subjData,
      id: `sub-${Date.now()}`,
    };
    const updated = [...subjects, newSubj];
    setSubjects(updated);
    storageService.saveSubjects(updated);
    addToast('success', `Subject ${newSubj.name} added`);
  };

  const updateSubject = (id: string, subjData: Partial<Subject>) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, ...subjData } : s));
    setSubjects(updated);
    storageService.saveSubjects(updated);
    addToast('success', 'Subject updated successfully');
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    storageService.saveSubjects(updated);
    addToast('info', 'Subject removed');
  };

  // Teachers
  const addTeacher = (tchData: Omit<Teacher, 'id' | 'employeeId' | 'fullName'>) => {
    const empId = `TCH-${String(teachers.length + 1).padStart(3, '0')}`;
    const newTeacher: Teacher = {
      ...tchData,
      id: `tch-${Date.now()}`,
      employeeId: empId,
      fullName: `${tchData.firstName} ${tchData.lastName}`,
    };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    storageService.saveTeachers(updated);
    addToast('success', `Teacher ${newTeacher.fullName} added`);
  };

  const updateTeacher = (id: string, tchData: Partial<Teacher>) => {
    const updated = teachers.map((t) => {
      if (t.id === id) {
        const fn = tchData.firstName ?? t.firstName;
        const ln = tchData.lastName ?? t.lastName;
        return {
          ...t,
          ...tchData,
          fullName: `${fn} ${ln}`,
        };
      }
      return t;
    });
    setTeachers(updated);
    storageService.saveTeachers(updated);
    addToast('success', 'Teacher profile updated');
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    storageService.saveTeachers(updated);
    addToast('info', 'Teacher deleted');
  };

  // Parents
  const addParent = (parentData: Omit<Parent, 'id' | 'fullName'>) => {
    const newParent: Parent = {
      ...parentData,
      id: `par-${Date.now()}`,
      fullName: `${parentData.firstName} ${parentData.lastName}`,
    };
    const updated = [...parents, newParent];
    setParents(updated);
    storageService.saveParents(updated);
    addToast('success', `Parent ${newParent.fullName} registered`);
  };

  const updateParent = (id: string, parentData: Partial<Parent>) => {
    const updated = parents.map((p) => {
      if (p.id === id) {
        const fn = parentData.firstName ?? p.firstName;
        const ln = parentData.lastName ?? p.lastName;
        return {
          ...p,
          ...parentData,
          fullName: `${fn} ${ln}`,
        };
      }
      return p;
    });
    setParents(updated);
    storageService.saveParents(updated);
    addToast('success', 'Parent information updated');
  };

  const deleteParent = (id: string) => {
    const updated = parents.filter((p) => p.id !== id);
    setParents(updated);
    storageService.saveParents(updated);
    addToast('info', 'Parent record removed');
  };

  // Students
  const addStudent = (stdData: Omit<Student, 'id' | 'admissionNo' | 'fullName'>) => {
    const currentYear = new Date().getFullYear();
    const admNo = `BCGS-${currentYear}-${String(students.length + 1001)}`;
    const newStudent: Student = {
      ...stdData,
      id: `std-${Date.now()}`,
      admissionNo: admNo,
      fullName: `${stdData.firstName} ${stdData.lastName}`,
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    storageService.saveStudents(updated);

    // If guardian exists, link student to guardian
    if (newStudent.guardianId) {
      const parent = parents.find((p) => p.id === newStudent.guardianId);
      if (parent && !parent.linkedStudentIds.includes(newStudent.id)) {
        updateParent(parent.id, {
          linkedStudentIds: [...parent.linkedStudentIds, newStudent.id],
        });
      }
    }

    addToast('success', `Student ${newStudent.fullName} enrolled (${admNo})`);
  };

  const updateStudent = (id: string, stdData: Partial<Student>) => {
    const updated = students.map((s) => {
      if (s.id === id) {
        const fn = stdData.firstName ?? s.firstName;
        const ln = stdData.lastName ?? s.lastName;
        return {
          ...s,
          ...stdData,
          fullName: `${fn} ${ln}`,
        };
      }
      return s;
    });
    setStudents(updated);
    storageService.saveStudents(updated);
    addToast('success', 'Student details updated');
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    storageService.saveStudents(updated);
    addToast('info', 'Student deleted');
  };

  const promoteStudents = (
    studentIds: string[],
    targetClassId: string,
    targetSectionId: string,
    targetSessionId: string
  ) => {
    const updated = students.map((s) => {
      if (studentIds.includes(s.id)) {
        return {
          ...s,
          classId: targetClassId,
          sectionId: targetSectionId,
          sessionId: targetSessionId,
        };
      }
      return s;
    });
    setStudents(updated);
    storageService.saveStudents(updated);
    addToast('success', `Promoted ${studentIds.length} student(s) successfully`);
  };

  // Attendance
  const saveAttendanceBatch = (newRecords: Omit<AttendanceRecord, 'id'>[]) => {
    // Filter out existing records for same student on same date
    const dates = new Set(newRecords.map((r) => r.date));
    const studentIds = new Set(newRecords.map((r) => r.studentId));

    const remaining = attendance.filter(
      (a) => !(dates.has(a.date) && studentIds.has(a.studentId))
    );

    const generated: AttendanceRecord[] = newRecords.map((r, i) => ({
      ...r,
      id: `att-${Date.now()}-${i}`,
    }));

    const updated = [...remaining, ...generated];
    setAttendance(updated);
    storageService.saveAttendance(updated);
    addToast('success', `Attendance recorded for ${newRecords.length} student(s)`);
  };

  // Fees
  const recordFeePayment = (
    id: string,
    paidAmount: number,
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online Slip',
    remarks?: string
  ) => {
    const updated = fees.map((f) => {
      if (f.id === id) {
        const newPaid = f.paidAmount + paidAmount;
        const newBalance = Math.max(0, f.netAmount - newPaid);
        const newStatus: FeeRecord['status'] =
          newBalance <= 0 ? 'paid' : newPaid > 0 ? 'partial' : f.status;

        return {
          ...f,
          paidAmount: newPaid,
          balance: newBalance,
          status: newStatus,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod,
          remarks: remarks ? `${f.remarks ? f.remarks + '; ' : ''}${remarks}` : f.remarks,
        };
      }
      return f;
    });
    setFees(updated);
    storageService.saveFees(updated);
    addToast('success', `Payment of PKR ${paidAmount.toLocaleString()} recorded`);
  };

  const generateMonthlyFees = (
    classId: string,
    month: string,
    year: number,
    dueDate: string
  ): number => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return 0;

    const classStudents = students.filter(
      (s) => s.classId === classId && s.status === 'active'
    );

    let createdCount = 0;
    const newRecords: FeeRecord[] = [];

    classStudents.forEach((student, index) => {
      // Check if fee record already exists for student, month, year
      const exists = fees.some(
        (f) => f.studentId === student.id && f.month === month && f.year === year
      );
      if (!exists) {
        const invoiceNo = `INV-${year}-${String(fees.length + createdCount + 1001)}`;
        newRecords.push({
          id: `fee-${Date.now()}-${index}`,
          invoiceNo,
          studentId: student.id,
          classId,
          month,
          year,
          amount: targetClass.monthlyFee,
          discount: 0,
          netAmount: targetClass.monthlyFee,
          paidAmount: 0,
          balance: targetClass.monthlyFee,
          status: 'unpaid',
          dueDate,
        });
        createdCount++;
      }
    });

    if (createdCount > 0) {
      const updated = [...fees, ...newRecords];
      setFees(updated);
      storageService.saveFees(updated);
      addToast('success', `Generated ${createdCount} monthly fee record(s) for ${month}`);
    } else {
      addToast('info', `Fee records for ${month} already exist for all students in this class`);
    }

    return createdCount;
  };

  const addCustomFeeRecord = (recordData: Omit<FeeRecord, 'id' | 'invoiceNo'>) => {
    const invoiceNo = `INV-${recordData.year}-${String(fees.length + 1001)}`;
    const newRecord: FeeRecord = {
      ...recordData,
      id: `fee-${Date.now()}`,
      invoiceNo,
    };
    const updated = [...fees, newRecord];
    setFees(updated);
    storageService.saveFees(updated);
    addToast('success', `Challan ${invoiceNo} generated`);
  };

  const recordPaymentTransaction = (data: {
    feeRecordId: string;
    amount: number;
    paymentMethod: PaymentTransaction['paymentMethod'];
    paymentDate?: string;
    referenceNo?: string;
    remarks?: string;
    accountantName?: string;
  }): { success: boolean; transaction?: PaymentTransaction; error?: string } => {
    const fee = fees.find((f) => f.id === data.feeRecordId);
    if (!fee) {
      addToast('error', 'Fee record not found');
      return { success: false, error: 'Fee record not found' };
    }

    if (data.amount <= 0) {
      addToast('error', 'Payment amount must be greater than zero');
      return { success: false, error: 'Payment amount must be greater than zero' };
    }

    if (data.amount > fee.balance) {
      addToast('error', `Payment cannot exceed outstanding balance of PKR ${fee.balance.toLocaleString()}`);
      return { success: false, error: `Payment cannot exceed balance of PKR ${fee.balance.toLocaleString()}` };
    }

    const previousBalance = fee.balance;
    const newPaidAmount = fee.paidAmount + data.amount;
    const newBalance = Math.max(0, fee.netAmount - newPaidAmount);
    const newStatus: FeeRecord['status'] = newBalance <= 0 ? 'paid' : 'partial';
    const payDate = data.paymentDate || new Date().toISOString().split('T')[0];

    const receiptNo = `RCP-${new Date().getFullYear()}-${String(payments.length + 1001)}`;
    const newTransaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      receiptNo,
      feeRecordId: fee.id,
      studentId: fee.studentId,
      classId: fee.classId,
      amount: data.amount,
      paymentDate: payDate,
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo || '',
      remarks: data.remarks || '',
      accountantName: data.accountantName || 'Muhammad Arif',
      recordedAt: new Date().toISOString(),
      previousBalance,
      newBalance,
    };

    const updatedFees = fees.map((f) => {
      if (f.id === fee.id) {
        return {
          ...f,
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
          paymentDate: payDate,
          paymentMethod: data.paymentMethod === 'Other' ? 'Cash' : data.paymentMethod,
          remarks: data.remarks ? `${f.remarks ? f.remarks + '; ' : ''}${data.remarks}` : f.remarks,
        };
      }
      return f;
    });

    const updatedPayments = [newTransaction, ...payments];

    setFees(updatedFees);
    storageService.saveFees(updatedFees);

    setPayments(updatedPayments);
    storageService.savePayments(updatedPayments);

    addToast('success', `Receipt ${receiptNo}: PKR ${data.amount.toLocaleString()} received successfully`);
    return { success: true, transaction: newTransaction };
  };

  // Tests
  const saveTest = (testData: Omit<Test, 'id'> & { id?: string }) => {
    if (testData.id) {
      const updated = tests.map((t) => (t.id === testData.id ? (testData as Test) : t));
      setTests(updated);
      storageService.saveTests(updated);
      addToast('success', 'Test assessment updated');
    } else {
      const newTest: Test = {
        ...(testData as Omit<Test, 'id'>),
        id: `tst-${Date.now()}`,
      };
      const updated = [...tests, newTest];
      setTests(updated);
      storageService.saveTests(updated);
      addToast('success', `Assessment created (${newTest.status === 'published' ? 'Published' : 'Draft'})`);
    }
  };

  const publishTest = (id: string) => {
    const updated = tests.map((t) => (t.id === id ? { ...t, status: 'published' as const } : t));
    setTests(updated);
    storageService.saveTests(updated);
    addToast('success', 'Test results published! Visible to parents and students.');
  };

  const deleteTest = (id: string) => {
    const updated = tests.filter((t) => t.id !== id);
    setTests(updated);
    storageService.saveTests(updated);
    addToast('info', 'Assessment deleted');
  };

  // Notices
  const addNotice = (noticeData: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `ntc-${Date.now()}`,
    };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    storageService.saveNotices(updated);
    addToast('success', 'Circular / Notice published');
  };

  const deleteNotice = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    storageService.saveNotices(updated);
    addToast('info', 'Notice deleted');
  };

  // Users
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    storageService.saveUsers(updated);
    addToast('success', `User account ${newUser.email} created`);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    setUsers(updated);
    storageService.saveUsers(updated);
    addToast('success', 'User profile updated');
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    storageService.saveUsers(updated);
    addToast('info', 'User account deleted');
  };

  // Reset
  const resetAllData = () => {
    storageService.resetToSeedData();
    setSettings(storageService.getSettings());
    setSessions(storageService.getSessions());
    setClasses(storageService.getClasses());
    setSubjects(storageService.getSubjects());
    setTeachers(storageService.getTeachers());
    setParents(storageService.getParents());
    setStudents(storageService.getStudents());
    setAttendance(storageService.getAttendance());
    setFees(storageService.getFees());
    setPayments(storageService.getPayments());
    setTests(storageService.getTests());
    setNotices(storageService.getNotices());
    setUsers(storageService.getUsers());
    addToast('info', 'Demo data successfully reset to initial state');
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        sessions,
        currentSession,
        switchCurrentSession,
        addSession,
        classes,
        addClass,
        updateClass,
        deleteClass,
        addSection,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        parents,
        addParent,
        updateParent,
        deleteParent,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        promoteStudents,
        attendance,
        saveAttendanceBatch,
        fees,
        recordFeePayment,
        generateMonthlyFees,
        addCustomFeeRecord,
        payments,
        recordPaymentTransaction,
        tests,
        saveTest,
        publishTest,
        deleteTest,
        notices,
        addNotice,
        deleteNotice,
        users,
        addUser,
        updateUser,
        deleteUser,
        resetAllData,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
