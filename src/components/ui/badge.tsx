import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] leading-none font-semibold tracking-[-0.12px] whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--apple-primary)] text-[var(--apple-on-primary)]',
        subtle:
          'border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] text-[var(--apple-ink-muted-80)]',
        active:
          'border-[var(--apple-primary)]/25 bg-[var(--apple-primary)]/10 text-[var(--apple-primary)]',
        dark: 'border-transparent bg-[var(--apple-ink)] text-[var(--apple-on-dark)]',
        overdue: 'border-[#c92a2a]/25 bg-[#c92a2a]/10 text-[#a61e1e]',
      },
    },
    defaultVariants: {
      variant: 'subtle',
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
