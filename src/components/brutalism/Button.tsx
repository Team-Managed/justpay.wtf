import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'brand' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'dark' | 'ghost';
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  icon?: ReactNode;
}

export function BrutalistButton({
  variant = 'brand',
  size = 'base',
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-bold font-sans box-border transition-all duration-150";
  
  const sizeClasses = {
    xs: "text-[12px] px-[12px] py-[6px]",
    sm: "text-[14px] px-[12px] py-[8px]",
    base: "text-[14px] px-[16px] py-[10px]",
    lg: "text-[16px] px-[20px] py-[12px]",
    xl: "text-[16px] px-[24px] py-[14px]",
  };

  const variantClasses = {
    brand: "bg-[var(--color-brand)] text-black border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-brand-strong)] hover:shadow-[var(--shadow-sm)]",
    secondary: "bg-[var(--color-neutral-secondary-medium)] text-black border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-neutral-tertiary-medium)] hover:shadow-[var(--shadow-sm)]",
    tertiary: "bg-[var(--color-neutral-primary-soft)] text-black border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-neutral-secondary-medium)] hover:shadow-[var(--shadow-sm)]",
    success: "bg-[var(--color-success)] text-black border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-success-medium)] hover:shadow-[var(--shadow-sm)]",
    danger: "bg-[var(--color-danger)] text-white border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-danger-medium)] hover:shadow-[var(--shadow-sm)]",
    warning: "bg-[var(--color-warning)] text-black border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-warning-medium)] hover:shadow-[var(--shadow-sm)]",
    dark: "bg-[var(--color-dark)] text-white border-2 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
    ghost: "bg-transparent text-[var(--color-heading)] border-2 border-[var(--color-border-default)] hover:bg-[var(--color-neutral-secondary-medium)]",
  };

  const disabledClasses = "bg-[var(--color-disabled)] border-2 border-[var(--color-border-default)] text-[var(--color-fg-disabled)] cursor-not-allowed shadow-none hover:shadow-none hover:bg-[var(--color-disabled)]";

  const appliedVariant = disabled ? disabledClasses : variantClasses[variant];
  const roundedClass = "rounded-[6px]";

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${appliedVariant} ${roundedClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-[8px] flex items-center justify-center w-[16px] h-[16px]">{icon}</span>}
      {children}
    </button>
  );
}
