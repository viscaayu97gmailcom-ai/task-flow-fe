import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type InputProps = ComponentProps<'input'>;

function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex min-h-11 w-full rounded-[11px] border border-[rgb(0_0_0_/_0.14)] bg-[var(--apple-canvas)] px-4 py-2.5 text-[17px] leading-[1.47] font-normal tracking-[-0.374px] text-[var(--apple-ink)] placeholder:text-[var(--apple-ink-muted-48)] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
