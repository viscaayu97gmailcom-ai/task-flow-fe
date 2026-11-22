'use client';

import {
  AlertCircle,
  Calendar,
  Clock,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, isTaskOverdue } from '@/lib/format-date';
import { useTaskDetailQuery } from '@/services/task.service';
import type { Task } from '@/types/task';
import { TaskStatusBadge } from './task-status-badge';

interface TaskDetailDialogProps {
  taskId: string | null;
  fallbackTask?: Task | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
  onChangeStatus: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDetailDialog({
  taskId,
  fallbackTask,
  onOpenChange,
  onEdit,
  onChangeStatus,
  onDelete,
}: TaskDetailDialogProps) {
  const open = Boolean(taskId);
  const { data, isPending, isError, error, refetch } =
    useTaskDetailQuery(taskId);

  const task = data?.data ?? fallbackTask ?? null;
  const overdue = task ? isTaskOverdue(task.dueDate, task.status) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            Live record fetched from the TaskFlow API.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          {isPending && !task ? (
            <div className="space-y-4">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          ) : isError && !task ? (
            <div
              role="alert"
              className="space-y-3 rounded-[11px] border border-[#c92a2a]/25 bg-[#fce8e6] p-4 text-[14px] text-[#a61e1e]"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <p>
                  {error instanceof Error
                    ? error.message
                    : 'Failed to load task details.'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void refetch();
                }}
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                <span>Retry</span>
              </Button>
            </div>
          ) : task ? (
            <>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                  {overdue ? (
                    <span className="inline-flex items-center rounded-full bg-[#c92a2a]/10 px-3 py-1 text-[12px] font-semibold text-[#a61e1e]">
                      Overdue
                    </span>
                  ) : null}
                </div>

                <h3 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]">
                  {task.title}
                </h3>

                <p className="whitespace-pre-wrap text-[17px] leading-[1.47] font-normal tracking-[-0.374px] text-[var(--apple-ink-muted-80)]">
                  {task.description?.trim()
                    ? task.description
                    : 'No description provided for this task.'}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-3 rounded-[11px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] p-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-[12px] font-semibold tracking-[-0.12px] text-[var(--apple-ink-muted-48)]">
                    <Calendar aria-hidden="true" className="size-3.5" />
                    <span>Due Date</span>
                  </dt>
                  <dd className="text-[14px] leading-[1.43] text-[var(--apple-ink)]">
                    {task.dueDate
                      ? formatDateTime(task.dueDate)
                      : 'No due date'}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-[12px] font-semibold tracking-[-0.12px] text-[var(--apple-ink-muted-48)]">
                    <Clock aria-hidden="true" className="size-3.5" />
                    <span>Last Updated</span>
                  </dt>
                  <dd className="text-[14px] leading-[1.43] text-[var(--apple-ink)]">
                    {formatDateTime(task.updatedAt)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-[12px] font-semibold tracking-[-0.12px] text-[var(--apple-ink-muted-48)]">
                    Created
                  </dt>
                  <dd className="text-[14px] leading-[1.43] text-[var(--apple-ink)]">
                    {formatDateTime(task.createdAt)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-[12px] font-semibold tracking-[-0.12px] text-[var(--apple-ink-muted-48)]">
                    Task ID
                  </dt>
                  <dd className="truncate font-mono text-[12px] text-[var(--apple-ink-muted-80)]">
                    {task.id}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </DialogBody>

        <DialogFooter className="justify-between">
          {task ? (
            <Button
              type="button"
              variant="destructive-outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(task);
              }}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              <span>Delete</span>
            </Button>
          ) : (
            <span />
          )}

          <div className="flex flex-wrap items-center gap-2">
            {task ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onChangeStatus(task);
                  }}
                >
                  <span>Status</span>
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(task);
                  }}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  <span>Edit Task</span>
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
