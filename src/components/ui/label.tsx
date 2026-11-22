import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        'block text-[14px] leading-[1.29] font-semibold tracking-[-0.224px] text-[var(--apple-ink)]',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
