'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import type { ComponentProps } from 'react';
import { DayPicker } from 'react-day-picker';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn('p-1.5', className)}
      classNames={{
        months: 'relative flex flex-col gap-4 sm:flex-row',
        month: 'flex w-full flex-col gap-3',
        month_caption:
          'relative flex h-9 items-center justify-center px-8 text-[14px] font-semibold tracking-[-0.224px] text-[var(--apple-ink)]',
        caption_label: 'text-[14px] font-semibold tracking-[-0.224px]',
        nav: 'absolute inset-x-0 top-0 flex h-9 items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-8 min-h-8 min-w-8 rounded-full p-0 text-[var(--apple-ink-muted-80)] hover:bg-[var(--apple-canvas-parchment)]',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-8 min-h-8 min-w-8 rounded-full p-0 text-[var(--apple-ink-muted-80)] hover:bg-[var(--apple-canvas-parchment)]',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'w-9 rounded-[8px] text-center text-[12px] font-normal text-[var(--apple-ink-muted-48)]',
        week: 'mt-1 flex w-full',
        day: 'relative flex size-9 items-center justify-center p-0 text-center text-[13px] [&:has([aria-selected])]:rounded-full',
        day_button:
          'inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[13px] font-normal text-[var(--apple-ink)] transition-colors hover:bg-[var(--apple-canvas-parchment)] focus-visible:outline-2 focus-visible:outline-[var(--apple-primary-focus)] aria-selected:bg-[var(--apple-primary)] aria-selected:font-semibold aria-selected:text-white aria-selected:hover:bg-[var(--apple-primary)]',
        today:
          '[&>button]:bg-[var(--apple-canvas-parchment)] [&>button]:font-semibold [&>button]:text-[var(--apple-primary)]',
        outside:
          '[&>button]:text-[var(--apple-ink-muted-48)] [&>button]:opacity-50',
        disabled:
          '[&>button]:pointer-events-none [&>button]:text-[var(--apple-ink-muted-48)] [&>button]:opacity-40',
        selected:
          '[&>button]:bg-[var(--apple-primary)] [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-[var(--apple-primary)]',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeft
                aria-hidden="true"
                className={cn('size-4', chevronClassName)}
              />
            );
          }
          if (orientation === 'right') {
            return (
              <ChevronRight
                aria-hidden="true"
                className={cn('size-4', chevronClassName)}
              />
            );
          }
          if (orientation === 'up') {
            return (
              <ChevronUp
                aria-hidden="true"
                className={cn('size-4', chevronClassName)}
              />
            );
          }
          return (
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4', chevronClassName)}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
