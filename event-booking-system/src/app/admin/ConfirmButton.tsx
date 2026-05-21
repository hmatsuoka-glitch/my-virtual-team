'use client';

import type { MouseEvent } from 'react';

export default function ConfirmButton({
  children,
  className,
  confirmMessage,
  name,
  value,
}: {
  children: React.ReactNode;
  className?: string;
  confirmMessage: string;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={className}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
