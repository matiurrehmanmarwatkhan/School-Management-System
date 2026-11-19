import React from 'react';
import { AttendanceStatus, FeeStatus, StudentStatus, TestStatus } from '../../types';
import { Check, Clock, AlertCircle, FileText, Ban, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  type: 'attendance' | 'fee' | 'student' | 'test';
  value?: string;
  status?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, status }) => {
  const effectiveValue = (value || status || '').toLowerCase();
  if (type === 'attendance') {
    const val = effectiveValue as AttendanceStatus;
    switch (val) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Present</span>
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Absent</span>
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Late</span>
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Leave</span>
          </span>
        );
    }
  }

  if (type === 'fee') {
    const val = effectiveValue as FeeStatus;
    switch (val) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid</span>
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Unpaid</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Partially Paid</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Overdue</span>
          </span>
        );
    }
  }

  if (type === 'student') {
    const val = effectiveValue as StudentStatus;
    switch (val) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Inactive</span>
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            <Ban className="w-3.5 h-3.5" />
            <span>Withdrawn</span>
          </span>
        );
    }
  }

  if (type === 'test') {
    const val = effectiveValue as TestStatus;
    if (val === 'published') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Published</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
        <Clock className="w-3.5 h-3.5" />
        <span>Draft</span>
      </span>
    );
  }

  return <span className="text-xs text-slate-600 dark:text-slate-300 capitalize">{effectiveValue}</span>;
};
