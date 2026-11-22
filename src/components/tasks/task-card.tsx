'use client';

import {
  ArrowUpRight,
  Calendar,
  Eye,
  MoreHorizontal,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatShortDate, isTaskOverdue } from '@/lib/format-date';
import { usePrefetchTaskDetail } from '@/services/task.service';
import type { Task } from '@/types/task';
import { TaskStatusBadge } from './task-status-badge';

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onChangeStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({
  task,
  onView,
  onChangeStatus,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task.dueDate, task.status);
  const prefetchDetail = usePrefetchTaskDetail();

  return (
    <Card className="@container flex h-full flex-col justify-between transition-colors hover:border-[#c8c8cd]">
      <div>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              {overdue ? <Badge variant="overdue">Overdue</Badge> : null}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Actions for ${task.title}`}
                className="inline-flex size-10 min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--apple-divider-soft)] bg-[var(--apple-surface-pearl)] text-[var(--apple-ink-muted-80)] transition-transform duration-150 hover:bg-[var(--apple-canvas-parchment)] active:scale-95"
              >
                <MoreHorizontal aria-hidden="true" className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onView(task)}>
                    <Eye aria-hidden="true" />
                    <span>Quick View</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus(task)}>
                    <SlidersHorizontal aria-hidden="true" />
                    <span>Change Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil aria-hidden="true" />
                    <span>Edit Task</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(task)}
                >
                  <Trash2 aria-hidden="true" />
                  <span>Delete Task</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardTitle className="line-clamp-2">
            <Link
              href={`/tasks/${task.id}`}
              onMouseEnter={() => prefetchDetail(task.id)}
              onFocus={() => prefetchDetail(task.id)}
              className="text-left text-[17px] leading-[1.24] font-semibold tracking-[-0.374px] text-[var(--apple-ink)] transition-colors hover:text-[var(--apple-primary)]"
            >
              {task.title}
            </Link>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-3">
          <p className="line-clamp-3 min-h-[3.75rem] text-[14px] leading-[1.43] font-normal tracking-[-0.224px] text-[var(--apple-ink-muted-80)]">
            {task.description?.trim()
              ? task.description
              : 'No additional notes. Open the task page or quick view to review or update this item.'}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] leading-[1.3] font-normal tracking-[-0.12px] text-[var(--apple-ink-muted-48)]">
            <span className="inline-flex items-center gap-1.5">
              <Calendar aria-hidden="true" className="size-3.5" />
              <span>{formatShortDate(task.dueDate)}</span>
            </span>
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex-col items-stretch gap-2 @[20rem]:flex-row @[20rem]:items-center @[20rem]:justify-between">
        <Link
          href={`/tasks/${task.id}`}
          onMouseEnter={() => prefetchDetail(task.id)}
          onFocus={() => prefetchDetail(task.id)}
          aria-label={`Open detail page for ${task.title}`}
          className="inline-flex min-h-11 items-center gap-1 text-[14px] font-normal tracking-[-0.224px] text-[var(--apple-primary)] transition-transform duration-150 hover:underline active:scale-95"
        >
          <span>Open Page</span>
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>

        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="pearl"
            size="compact"
            onClick={() => onChangeStatus(task)}
          >
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            <span>Status</span>
          </Button>
          <Button
            type="button"
            variant="pearl"
            size="compact"
            onClick={() => onEdit(task)}
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            <span>Edit</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
