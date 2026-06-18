import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BrutalistCard({
  children,
  interactive = false,
  className = '',
  onClick
}: CardProps) {
  const baseClasses = "bg-[var(--color-neutral-primary-soft)] border-2 border-[var(--color-border-default)] rounded-[6px] shadow-[var(--shadow-sm)] text-[var(--color-body)] box-border";
  const interactiveClasses = interactive ? "cursor-pointer transition-all duration-150 hover:shadow-[var(--shadow-xl)] hover:-translate-y-1 hover:-translate-x-1" : "";

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
