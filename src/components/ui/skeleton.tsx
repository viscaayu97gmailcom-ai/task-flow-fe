import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-[8px] bg-[var(--apple-divider-soft)]',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
