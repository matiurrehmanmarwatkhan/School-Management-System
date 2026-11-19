import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ShieldCheck, UserCheck, Key, Lock, CheckCircle2, Plus, Receipt } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, addToast } = useApp();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Add user modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('accountant');
  const [newPhone, setNewPhone] = useState('');

  // Role permissions breakdown table including Accountant
  const rolePermissions = [
    {
      module: 'Student Records & Admissions',
      admin: 'Full CRUD',
      accountant: 'View & Ledgers',
      teacher: 'View Assigned',
      parent: 'View Linked Only',
      student: 'View Own Only',
    },
    {
      module: 'Attendance Registers',
      admin: 'Full CRUD & Audit',
      accountant: 'No Access',
      teacher: 'Mark & Edit Assigned',
      parent: 'Read-only',
      student: 'Read-only',
    },
    {
      module: 'Fee Ledgers & Vouchers (PKR)',
      admin: 'Full Configuration',
      accountant: 'Full Processing & Receipts',
      teacher: 'No Access',
      parent: 'View & Print Receipts',
      student: 'View Dues & Receipts',
    },
    {
      module: 'Payment Transactions & Cashbook',
      admin: 'Full Audit',
      accountant: 'Record & Issue Receipts',
      teacher: 'No Access',
      parent: 'View Own',
      student: 'View Own',
    },
    {
      module: 'Assessments & Grading',
      admin: 'Full Audit & Publish',
      accountant: 'No Access',
      teacher: 'Create & Grade Assigned',
      parent: 'View Published Only',
      student: 'View Published Only',
    },
    {
      module: 'System Settings & Sessions',
      admin: 'Full Configuration',
      accountant: 'View Sessions',
      teacher: 'No Access',
      parent: 'No Access',
      student: 'No Access',
    },
  ];

  const handleToggleStatus = (u: User) => {
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    updateUser(u.id, { status: nextStatus });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('error', 'Passwords do not match');
      return;
    }
    setIsPasswordModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    addToast('success', `Simulated password updated for ${selectedUserForPassword?.email}`);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      addToast('error', 'Name and Email are required');
      return;
    }

    addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      phone: newPhone.trim() || undefined,
      status: 'active',
    });

    setIsAddUserModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('accountant');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User & Role Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Demo portal access profiles, role-based capability boundaries, and accountant security assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Demo Security Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
        <span className="font-semibold block mb-0.5">Frontend Demonstration Notice:</span>
        These credentials operate within client-side LocalStorage to demonstrate multi-role portal workflows (Admin, Accountant, Teacher, Parent, Student). In production environments, authentication is managed via secure server-side tokens and encrypted database stores.
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Registered Demo Accounts
          </h3>
          <span className="text-xs text-slate-400">{users.length} System Users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email / Login ID</th>
                <th className="py-3 px-4">Portal Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : u.role === 'accountant'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                          : u.role === 'teacher'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : u.role === 'parent'
                          ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        u.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span className="capitalize">{u.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUserForPassword(u);
                          setIsPasswordModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Simulate Password Change"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                          u.status === 'active'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            5-Role Permission Matrix
          </h3>
          <p className="text-xs text-slate-500">Access policies enforced across portals in this application</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Functional Module</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Accountant</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Parent</th>
                <th className="py-3 px-4">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rolePermissions.map((rp, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {rp.module}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">{rp.admin}</td>
                  <td className="py-3 px-4 text-blue-600 font-bold">{rp.accountant}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rp.teacher}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rp.parent}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rp.student}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add System Account"
        description="Register a new user and assign a portal role."
        maxWidth="md"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Asad Siddiqui"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email / Login ID</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. asad.accountant@school.edu"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Portal Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Simulated Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Demo Password"
        description={`Updating credentials for ${selectedUserForPassword?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
