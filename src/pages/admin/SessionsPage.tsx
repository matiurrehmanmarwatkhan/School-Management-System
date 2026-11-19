import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { Calendar, Plus, CheckCircle2, Check } from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const { sessions, currentSession, switchCurrentSession, addSession } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('2027-2028');
  const [startDate, setStartDate] = useState('2027-08-15');
  const [endDate, setEndDate] = useState('2028-06-20');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      name,
      startDate,
      endDate,
      isCurrent: false,
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Academic Sessions & Terms
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure school calendar years. Switching session updates current filtering and historical records.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((sess) => {
          const isCurrent = sess.id === currentSession?.id;
          return (
            <div
              key={sess.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs transition-all ${
                isCurrent
                  ? 'border-blue-500 dark:border-blue-500/80 ring-1 ring-blue-500'
                  : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Session {sess.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {formatDate(sess.startDate)} to {formatDate(sess.endDate)}
                  </div>
                </div>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    <Check className="w-3 h-3" />
                    <span>Active Session</span>
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                {!isCurrent ? (
                  <button
                    onClick={() => switchCurrentSession(sess.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Set as Active Session
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Currently Active In Portal</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Session Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Academic Session"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Session Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2027-2028"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">End Date *</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Create Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
