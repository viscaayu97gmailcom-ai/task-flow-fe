'use client';

import { CalendarIcon, Clock, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (nextLocalValue: string) => void;
  placeholder?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
}

const displayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatLocalDateTime(date: Date, timeStr: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const [hoursStr = '09', minutesStr = '00'] = timeStr.split(':');
  const hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr, 10);

  const safeHours = Number.isNaN(hours) ? 9 : Math.min(23, Math.max(0, hours));
  const safeMinutes = Number.isNaN(minutes)
    ? 0
    : Math.min(59, Math.max(0, minutes));

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(safeHours)}:${pad(safeMinutes)}`;
}

function extractTimePart(value: string): string {
  const idx = value.indexOf('T');
  if (idx === -1) return '09:00';
  const rawTime = value.slice(idx + 1, idx + 6);
  return /^\d{2}:\d{2}$/.test(rawTime) ? rawTime : '09:00';
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = 'Select date & time',
  ariaDescribedBy,
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => parseLocalDateTime(value), [value]);
  const timeValue = useMemo(() => extractTimePart(value), [value]);

  const handleSelectDate = (nextDay: Date | undefined) => {
    if (!nextDay) {
      onChange('');
      return;
    }
    onChange(formatLocalDateTime(nextDay, timeValue));
  };

  const handleTimeChange = (nextTime: string) => {
    const baseDate = selectedDate ?? new Date();
    onChange(formatLocalDateTime(baseDate, nextTime));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex w-full items-center">
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid="false"
          className={cn(
            'inline-flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-[11px] border border-[rgb(0_0_0_/_0.14)] bg-[var(--apple-canvas)] py-2.5 pr-9 pl-4 text-left text-[14px] leading-[1.43] font-normal tracking-[-0.224px] transition-colors hover:bg-[var(--apple-canvas-parchment)] disabled:cursor-not-allowed disabled:opacity-50',
            selectedDate
              ? 'text-[var(--apple-ink)]'
              : 'text-[var(--apple-ink-muted-48)]',
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <CalendarIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-[var(--apple-primary)]"
            />
            <span className="truncate">
              {selectedDate ? displayFormatter.format(selectedDate) : placeholder}
            </span>
          </span>
        </PopoverTrigger>

        {selectedDate && !disabled ? (
          <button
            type="button"
            aria-label="Clear due date"
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
            }}
            className="absolute right-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-[var(--apple-ink-muted-48)] hover:bg-[var(--apple-divider-soft)] hover:text-[var(--apple-ink)]"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>

      <PopoverContent align="end" className="w-[300px] p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
          defaultMonth={selectedDate ?? new Date()}
        />

        <Separator className="my-2.5" />

        <div className="space-y-2.5 px-1">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--apple-ink-muted-80)]">
              <Clock aria-hidden="true" className="size-3.5" />
              <span>Time</span>
            </span>
            <Input
              type="time"
              aria-label="Due time"
              value={timeValue}
              onChange={(event) => handleTimeChange(event.target.value)}
              className="h-9 min-h-9 w-[130px] rounded-[9px] px-3 py-1 text-[13px]"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="compact"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-[12px] text-[var(--apple-ink-muted-48)]"
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="default"
              size="compact"
              onClick={() => {
                if (!selectedDate) {
                  onChange(formatLocalDateTime(new Date(), timeValue));
                }
                setOpen(false);
              }}
              className="text-[12px]"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
