'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
