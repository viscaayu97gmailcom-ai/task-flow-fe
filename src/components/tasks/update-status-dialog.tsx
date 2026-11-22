'use client';

import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useUpdateTaskStatusMutation } from '@/services/task.service';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task';
import { TASK_STATUS_META } from './task-status-badge';

interface UpdateStatusDialogProps {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
}

export function UpdateStatusDialog({
  task,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  return (
    <UpdateStatusDialogInner
      key={task ? `${task.id}-${task.status}` : 'closed'}
      task={task}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
}

function UpdateStatusDialogInner({
  task,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    task?.status ?? 'TODO',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useUpdateTaskStatusMutation();

  const handleConfirm = async () => {
    if (!task) return;
    setErrorMessage(null);

    try {
      await mutation.mutateAsync({ id: task.id, status: selectedStatus });
      onOpenChange(false);
      const msg = `Status for "${task.title}" updated to ${TASK_STATUS_META[selectedStatus].label}.`;
      toast.success('Status updated', msg);
      onSuccess(msg);
    } catch (error) {
      const errMsg =
        error instanceof ApiError
          ? error.message
          : 'Unable to update task status.';
      setErrorMessage(errMsg);
      toast.error('Failed to update status', errMsg);
    }
  };

  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100dvw-2rem),30rem)]">
        <DialogHeader>
          <DialogTitle>Update Task Status</DialogTitle>
          <DialogDescription>
            {task
              ? `Choose the workflow stage for "${task.title}".`
              : 'Choose a workflow stage.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {errorMessage ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[11px] border border-[#c92a2a]/25 bg-[#fce8e6] px-4 py-3 text-[14px] text-[#a61e1e]"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div
            className="space-y-2.5"
            role="group"
            aria-label="Task status options"
          >
            {TASK_STATUSES.map((statusOption) => {
              const meta = TASK_STATUS_META[statusOption];
              const isSelected = selectedStatus === statusOption;

              return (
                <button
                  key={statusOption}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedStatus(statusOption)}
                  className={cn(
                    'flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-3 rounded-[18px] border bg-[var(--apple-canvas)] px-5 py-3 text-left transition-transform duration-150 active:scale-[0.98]',
                    isSelected
                      ? 'border-2 border-[var(--apple-primary-focus)]'
                      : 'border-[var(--apple-hairline)] hover:bg-[var(--apple-canvas-parchment)]',
                  )}
                >
                  <div>
                    <div className="text-[17px] leading-[1.24] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]">
                      {meta.label}
                    </div>
                    <div className="text-[14px] leading-[1.43] tracking-[-0.224px] text-[var(--apple-ink-muted-48)]">
                      {meta.description}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'inline-flex size-6 shrink-0 items-center justify-center rounded-full border',
                      isSelected
                        ? 'border-[var(--apple-primary)] bg-[var(--apple-primary)] text-white'
                        : 'border-[var(--apple-hairline)] bg-transparent text-transparent',
                    )}
                  >
                    <Check className="size-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={mutation.isPending || selectedStatus === task?.status}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {mutation.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              'Confirm Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
