import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-slate-400">{leftIcon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              'dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500',
              error
                ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-300 dark:border-slate-700',
              leftIcon ? 'pl-10' : undefined,
              rightIcon ? 'pr-10' : undefined,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute right-3 text-slate-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
