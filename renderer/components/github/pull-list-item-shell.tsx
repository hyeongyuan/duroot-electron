import { forwardRef } from 'react';

interface PullListItemShellProps {
  children: React.ReactNode;
  isExiting?: boolean;
}

export const PullListItemShell = forwardRef<HTMLLIElement, PullListItemShellProps>(
  ({ children, isExiting = false }, ref) => {
    return (
      <li
        ref={ref}
        className={`flex flex-col overflow-hidden origin-top transition-all duration-200 ease-out ${
          isExiting
            ? 'pointer-events-none max-h-0 -translate-y-1 scale-[0.98] px-4 py-0 opacity-0'
            : 'max-h-48 px-4 py-2 opacity-100'
        }`}
      >
        {children}
      </li>
    );
  },
);

PullListItemShell.displayName = 'PullListItemShell';
