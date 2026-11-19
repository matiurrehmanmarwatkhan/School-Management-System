import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Save, Users, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export const ParentProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { parents, students, classes, updateParent, addToast } = useApp();

  const currentParent = parents.find(
    (p) => p.id === currentUser?.linkedEntityId || p.email === currentUser?.email
  ) || parents[0];

  const linkedStudents = students.filter((s) => currentParent.linkedStudentIds.includes(s.id));

  const [phone, setPhone] = useState(currentParent.phone);
  const [email, setEmail] = useState(currentParent.email);
  const [address, setAddress] = useState(currentParent.address);
  const [occupation, setOccupation] = useState(currentParent.occupation);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateParent(currentParent.id, { phone, email, address, occupation });
    updateCurrentUserProfile({ phone, email });
    addToast('success', 'Guardian contact details updated');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Guardian Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your emergency contacts, residential billing address, and linked wards.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentParent.firstName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentParent.fullName}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Registered Guardian · {currentParent.occupation}
            </div>
          </div>
        </div>

        {/* Linked Children Strip */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Linked Students in School:
          </span>
          <div className="space-y-2">
            {linkedStudents.map((child) => {
              const cls = classes.find((c) => c.id === child.classId);
              return (
                <div
                  key={child.id}
                  className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {child.fullName}
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      Admission No: {child.admissionNo} · Roll #{child.rollNo}
                    </span>
                  </div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {cls?.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Contact Details */}
        <form onSubmit={handleSave} className="pt-4 space-y-4 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
            Edit Contact & Residential Information
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
              <label className="block font-medium mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Occupation / Employer</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Residential Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Contact Info</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
