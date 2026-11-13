import type { ReactNode } from 'react';

export const PRIMARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const SECONDARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';
export const CANCEL_BUTTON =
  'rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200';

export function StatusPanel({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/30">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
      {children && <div className="mt-6 flex w-full flex-col gap-2.5">{children}</div>}
    </div>
  );
}
