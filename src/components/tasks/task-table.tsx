'use client';

import {
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatDateTime,
  formatShortDate,
  isTaskOverdue,
} from '@/lib/format-date';
import { usePrefetchTaskDetail } from '@/services/task.service';
import type { Task } from '@/types/task';
import { TaskStatusBadge } from './task-status-badge';

interface TaskTableProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onChangeStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({
  tasks,
  onView,
  onChangeStatus,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const prefetchDetail = usePrefetchTaskDetail();

  return (
    <Table regionLabel="Tasks table">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[240px]">Task</TableHead>
          <TableHead className="w-[150px]">Status</TableHead>
          <TableHead className="w-[170px]">Due Date</TableHead>
          <TableHead className="w-[180px]">Updated</TableHead>
          <TableHead className="w-[96px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {tasks.map((task) => {
          const overdue = isTaskOverdue(task.dueDate, task.status);

          return (
            <TableRow key={task.id}>
              <th
                scope="row"
                className="sticky left-0 z-[1] border-b border-[var(--apple-divider-soft)] bg-[var(--apple-canvas)] px-5 py-4 text-left align-middle font-normal"
              >
                <div className="max-w-md space-y-1">
                  <Link
                    href={`/tasks/${task.id}`}
                    onMouseEnter={() => prefetchDetail(task.id)}
                    onFocus={() => prefetchDetail(task.id)}
                    className="inline-flex items-center gap-1 text-[16px] leading-[1.24] font-semibold tracking-[-0.374px] text-[var(--apple-ink)] hover:text-[var(--apple-primary)] hover:underline"
                  >
                    <span className="line-clamp-1">{task.title}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-[var(--apple-primary)]"
                    />
                  </Link>
                  {task.description ? (
                    <p className="line-clamp-1 text-[13px] text-[var(--apple-ink-muted-48)]">
                      {task.description}
                    </p>
                  ) : null}
                </div>
              </th>

              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="whitespace-nowrap">
                    {formatShortDate(task.dueDate)}
                  </span>
                  {overdue ? <Badge variant="overdue">Overdue</Badge> : null}
                </div>
              </TableCell>

              <TableCell className="whitespace-nowrap text-[13px] text-[var(--apple-ink-muted-48)]">
                {formatDateTime(task.updatedAt)}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`Open actions menu for ${task.title}`}
                    className="inline-flex size-10 min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--apple-divider-soft)] bg-[var(--apple-surface-pearl)] text-[var(--apple-ink)] transition-transform duration-150 hover:bg-[var(--apple-canvas-parchment)] active:scale-95"
                  >
                    <MoreHorizontal aria-hidden="true" className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(task)}>
                        <Eye aria-hidden="true" />
                        <span>Quick View Modal</span>
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
