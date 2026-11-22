import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Table({
  className,
  regionLabel = 'Data table',
  ...props
}: ComponentProps<'table'> & { regionLabel?: string }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={regionLabel}
      data-slot="table-container"
      className="@container relative w-full overflow-x-auto rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas)]"
    >
      <table
        data-slot="table"
        className={cn(
          'w-full border-separate border-spacing-0 caption-bottom text-left text-[14px] leading-[1.43] tracking-[-0.224px]',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'sticky top-0 z-10 bg-[var(--apple-canvas-parchment)] [&_tr]:border-b [&_tr]:border-[var(--apple-hairline)]',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child_td]:border-b-0 [&_tr:last-child_th]:border-b-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] font-semibold',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'transition-colors hover:bg-[var(--apple-surface-pearl)] data-[state=selected]:bg-[var(--apple-canvas-parchment)]',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        'h-12 border-b border-[var(--apple-hairline)] px-5 text-left align-middle text-[12px] font-semibold tracking-[-0.12px] whitespace-nowrap text-[var(--apple-ink-muted-80)]',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'border-b border-[var(--apple-divider-soft)] px-5 py-4 align-middle text-[14px] text-[var(--apple-ink)]',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        'mt-3 px-4 pb-3 text-left text-[12px] text-[var(--apple-ink-muted-48)]',
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
