'use client';

import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { useDeleteTaskMutation } from '@/services/task.service';
import type { Task } from '@/types/task';

interface DeleteTaskDialogProps {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
}

export function DeleteTaskDialog({
  task,
  onOpenChange,
  onSuccess,
}: DeleteTaskDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteTaskMutation();

  const handleDelete = async () => {
    if (!task) return;
    setErrorMessage(null);

    try {
      await deleteMutation.mutateAsync(task.id);
      onOpenChange(false);
      const msg = `Task "${task.title}" deleted.`;
      toast.success('Task deleted', msg);
      onSuccess(msg);
    } catch (error) {
      const errMsg =
        error instanceof ApiError
          ? error.message
          : 'Failed to delete the task.';
      setErrorMessage(errMsg);
      toast.error('Failed to delete task', errMsg);
    }
  };

  return (
    <AlertDialog
      open={Boolean(task)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setErrorMessage(null);
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will remove the task from your active workspace list.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogBody className="space-y-4">
          {task ? (
            <div className="rounded-[11px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] px-4 py-3">
              <p className="text-[14px] font-semibold tracking-[-0.224px] text-[var(--apple-ink)]">
                {task.title}
              </p>
              {task.description ? (
                <p className="mt-1 line-clamp-2 text-[14px] leading-[1.43] text-[var(--apple-ink-muted-48)]">
                  {task.description}
                </p>
              ) : null}
            </div>
          ) : null}

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
        </AlertDialogBody>

        <AlertDialogFooter>
          <AlertDialogCancel autoFocus disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => {
              void handleDelete();
            }}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 aria-hidden="true" className="size-4" />
                <span>Delete Task</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
