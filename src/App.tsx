import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { ParentsPage } from './pages/admin/ParentsPage';
import { ClassesPage } from './pages/admin/ClassesPage';
import { SubjectsPage } from './pages/admin/SubjectsPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { FeesPage } from './pages/admin/FeesPage';
import { TestsPage } from './pages/admin/TestsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherTestsPage } from './pages/teacher/TeacherTestsPage';
import { TeacherResultsPage } from './pages/teacher/TeacherResultsPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';

// Parent Pages
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentAttendancePage } from './pages/parent/ParentAttendancePage';
import { ParentFeesPage } from './pages/parent/ParentFeesPage';
import { ParentResultsPage } from './pages/parent/ParentResultsPage';
import { ParentNoticesPage } from './pages/parent/ParentNoticesPage';
import { ParentProfilePage } from './pages/parent/ParentProfilePage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentNoticesPage } from './pages/student/StudentNoticesPage';

// Accountant Pages
import { AccountantDashboard } from './pages/accountant/AccountantDashboard';
import { FeeOverviewPage } from './pages/accountant/FeeOverviewPage';
import { RecordPaymentPage } from './pages/accountant/RecordPaymentPage';
import { PaymentHistoryPage } from './pages/accountant/PaymentHistoryPage';
import { OutstandingFeesPage } from './pages/accountant/OutstandingFeesPage';
import { FeeReportsPage } from './pages/accountant/FeeReportsPage';
import { StudentFeeLedgersPage } from './pages/accountant/StudentFeeLedgersPage';

import { UserRole } from './types';

// Route Guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: UserRole }> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to the user's appropriate portal dashboard
    return <Navigate to={`/${role || 'admin'}/dashboard`} replace />;
  }

  return <>{children}</>;
};

// Root redirector based on current user
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${role || 'admin'}/dashboard`} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="parents" element={<ParentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="academic-sessions" element={<SessionsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="tests" element={<TestsPage />} />
              <Route path="results" element={<Navigate to="/admin/tests" replace />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Teacher Portal Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<TeacherClassesPage />} />
              <Route path="students" element={<Navigate to="/teacher/classes" replace />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="tests" element={<TeacherTestsPage />} />
              <Route path="results" element={<TeacherResultsPage />} />
              <Route path="profile" element={<TeacherProfilePage />} />
            </Route>

            {/* Parent Portal Routes */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRole="parent">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/parent/dashboard" replace />} />
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="children" element={<ParentChildrenPage />} />
              <Route path="attendance" element={<ParentAttendancePage />} />
              <Route path="fees" element={<ParentFeesPage />} />
              <Route path="results" element={<ParentResultsPage />} />
              <Route path="notices" element={<ParentNoticesPage />} />
              <Route path="profile" element={<ParentProfilePage />} />
            </Route>

            {/* Student Portal Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="results" element={<StudentResultsPage />} />
              <Route path="fees" element={<StudentFeesPage />} />
              <Route path="notices" element={<StudentNoticesPage />} />
            </Route>

            {/* Accountant Portal Routes */}
            <Route
              path="/accountant"
              element={
                <ProtectedRoute allowedRole="accountant">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/accountant/dashboard" replace />} />
              <Route path="dashboard" element={<AccountantDashboard />} />
              <Route path="fees" element={<FeeOverviewPage />} />
              <Route path="fee-overview" element={<Navigate to="/accountant/fees" replace />} />
              <Route path="record-payment" element={<RecordPaymentPage />} />
              <Route path="payments" element={<PaymentHistoryPage />} />
              <Route path="payment-history" element={<Navigate to="/accountant/payments" replace />} />
              <Route path="transactions" element={<Navigate to="/accountant/payments" replace />} />
              <Route path="outstanding" element={<OutstandingFeesPage />} />
              <Route path="reports" element={<FeeReportsPage />} />
              <Route path="students" element={<StudentFeeLedgersPage />} />
            </Route>

            {/* Default fallback route */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
