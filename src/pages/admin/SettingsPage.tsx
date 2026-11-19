import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolSettings } from '../../types';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Settings, Save, RotateCcw, School, DollarSign, Sun, Moon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, sessions, resetAllData } = useApp();

  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Institutional & Portal Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure school identity, contact information, currency denomination (PKR), and demo persistence.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Identity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <School className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              School Profile & Branding
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">School Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Logo Text Acronym</label>
              <input
                type="text"
                required
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Principal / Head of Institution</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Official Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Currency & Academic Session */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              System Currency & Academic Session
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Currency Code (PKR enforced)</label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                All tuition fees and challan vouchers render in Pakistani Rupees.
              </span>
            </div>

            <div>
              <label className="block font-medium mb-1">Active Academic Session</label>
              <select
                value={formData.currentSessionId}
                onChange={(e) => setFormData({ ...formData, currentSessionId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Theme Mode</label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                <option value="light">Light Theme (Default)</option>
                <option value="dark">Dark Theme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetAllData}
        title="Reset All School Data?"
        message="This will reinitialize all student rolls, faculty timetables, and fee invoices to the factory demo seed state."
        confirmLabel="Reset Data"
        isDestructive={true}
      />
    </div>
  );
};
