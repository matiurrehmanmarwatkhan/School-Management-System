export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
  return `${currency} ${Math.round(amount).toLocaleString('en-PK')}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const calculateGrade = (percentage: number): { grade: string; color: string } => {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-700 dark:text-emerald-400' };
  if (percentage >= 80) return { grade: 'A', color: 'text-emerald-600 dark:text-emerald-400' };
  if (percentage >= 70) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400' };
  if (percentage >= 60) return { grade: 'C', color: 'text-amber-600 dark:text-amber-400' };
  if (percentage >= 50) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400' };
  return { grade: 'F', color: 'text-rose-600 dark:text-rose-400' };
};

export const exportToCSV = (
  first: string | Record<string, any>[],
  second: Record<string, any>[] | string
) => {
  let filename = 'export';
  let rows: Record<string, any>[] = [];

  if (typeof first === 'string') {
    filename = first;
    rows = (second as Record<string, any>[]) || [];
  } else {
    rows = first || [];
    filename = typeof second === 'string' ? second : 'export';
  }

  if (!rows || !rows.length) return;
  const cleanFilename = filename.endsWith('.csv') ? filename.slice(0, -4) : filename;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${cleanFilename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
