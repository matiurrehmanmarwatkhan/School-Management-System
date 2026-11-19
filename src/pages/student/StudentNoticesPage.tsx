import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { Bell, Pin, Calendar, User, CheckCircle2 } from 'lucide-react';

export const StudentNoticesPage: React.FC = () => {
  const { notices } = useApp();

  const studentNotices = notices.filter((n) => n.targetRoles.includes('student'));
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(['ntc-1']);

  const toggleRead = (id: string) => {
    if (readNoticeIds.includes(id)) {
      setReadNoticeIds(readNoticeIds.filter((x) => x !== id));
    } else {
      setReadNoticeIds([...readNoticeIds, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Student Notice Board
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Announcements regarding examinations, sports events, academic holidays, and school schedules.
        </p>
      </div>

      <div className="space-y-4">
        {studentNotices.map((n) => {
          const isRead = readNoticeIds.includes(n.id);
          return (
            <div
              key={n.id}
              className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs transition-shadow ${
                n.isPinned
                  ? 'border-blue-300 dark:border-blue-900 ring-1 ring-blue-500/20'
                  : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {n.isPinned && (
                    <span className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      <Pin className="w-3.5 h-3.5 rotate-45" />
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {n.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {n.category}
                  </span>
                  <button
                    onClick={() => toggleRead(n.id)}
                    className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                      isRead
                        ? 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                        : 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 font-semibold'
                    }`}
                  >
                    {isRead ? 'Mark Unread' : 'Mark as Read'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                {n.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Author: {n.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(n.date)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
