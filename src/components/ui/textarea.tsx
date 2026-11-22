import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = ComponentProps<'textarea'>;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[112px] w-full resize-y rounded-[11px] border border-[rgb(0_0_0_/_0.14)] bg-[var(--apple-canvas)] px-4 py-3 text-[17px] leading-[1.47] font-normal tracking-[-0.374px] text-[var(--apple-ink)] placeholder:text-[var(--apple-ink-muted-48)] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
