'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from '@/lib/format-date';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '@/services/task.service';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task';
import { TASK_STATUS_META } from './task-status-badge';

interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  task?: Task | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onAnnounce: (message: string) => void;
}

export function TaskFormDialog({
  open,
  mode,
  task,
  onOpenChange,
  onSuccess,
  onAnnounce,
}: TaskFormDialogProps) {
  const formKey = `${mode}-${task?.id ?? 'new'}-${open ? 'open' : 'closed'}`;

  return (
    <TaskFormDialogInner
      key={formKey}
      open={open}
      mode={mode}
      task={task}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      onAnnounce={onAnnounce}
    />
  );
}

function TaskFormDialogInner({
  open,
  mode,
  task,
  onOpenChange,
  onSuccess,
  onAnnounce,
}: TaskFormDialogProps) {
  const initialTitle = mode === 'edit' && task ? task.title : '';
  const initialDescription =
    mode === 'edit' && task?.description ? task.description : '';
  const initialStatus: TaskStatus =
    mode === 'edit' && task ? task.status : 'TODO';
  const initialDueDate =
    mode === 'edit' && task ? toDateTimeLocalValue(task.dueDate) : '';

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [dueDate, setDueDate] = useState(initialDueDate);

  const [titleInteracted, setTitleInteracted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const discardButtonRef = useRef<HTMLButtonElement>(null);

  const titleId = useId();
  const titleHintId = useId();
  const titleErrorId = useId();
  const descId = useId();
  const descHintId = useId();
  const statusId = useId();
  const dueDateId = useId();
  const dueDateHintId = useId();
  const discardNoticeId = useId();

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const trimmedTitle = title.trim();
  const titleValidationError =
    trimmedTitle.length === 0
      ? 'Enter a task title (at least 1 character).'
      : trimmedTitle.length > 255
        ? 'Shorten the task title to 255 characters or fewer.'
        : null;

  const showTitleError =
    (titleInteracted || submitAttempted) && titleValidationError !== null;

  const isDirty =
    title !== initialTitle ||
    description !== initialDescription ||
    status !== initialStatus ||
    dueDate !== initialDueDate;

  const handleRequestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    if (isSubmitting) return;
    if (isDirty && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      onAnnounce(
        'You have unsaved changes. Choose Discard changes or Keep editing.',
      );
      window.setTimeout(() => {
        discardButtonRef.current?.focus();
      }, 0);
      return;
    }
    setShowDiscardConfirm(false);
    onOpenChange(false);
  };

  const handleTitleBlur = () => {
    if (title.length > 0 || submitAttempted) {
      setTitleInteracted(true);
      if (titleValidationError) {
        window.setTimeout(() => {
          onAnnounce(`Task title: Error: ${titleValidationError}`);
        }, 500);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerError(null);
    setShowDiscardConfirm(false);

    if (titleValidationError) {
      setTitleInteracted(true);
      titleInputRef.current?.focus();
      toast.error('Validation failed', titleValidationError);
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: description.trim() ? description.trim() : null,
      status,
      dueDate: fromDateTimeLocalValue(dueDate),
    };

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        onOpenChange(false);
        const msg = `Task "${trimmedTitle}" created.`;
        toast.success('Task created', msg);
        onSuccess(msg);
      } else if (task) {
        await updateMutation.mutateAsync({ id: task.id, payload });
        onOpenChange(false);
        const msg = `Task "${trimmedTitle}" updated.`;
        toast.success('Task updated', msg);
        onSuccess(msg);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const detail = error.errors?.length
          ? `${error.message}: ${error.errors.join(', ')}`
          : error.message;
        setServerError(detail);
        toast.error(
          mode === 'create' ? 'Failed to create task' : 'Failed to update task',
          detail,
        );
      } else {
        const fallback = 'Something went wrong while saving the task.';
        setServerError(fallback);
        toast.error(
          mode === 'create' ? 'Failed to create task' : 'Failed to update task',
          fallback,
        );
      }
    }
  };

  const statusItems = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, TASK_STATUS_META[s].label]),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={handleRequestClose}
      disablePointerDismissal={isDirty}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Define the task title, details, status, and optional target schedule.'
              : 'Update the task information below and save your changes.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogBody className="space-y-5">
            {serverError ? (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-[11px] border border-[#c92a2a]/25 bg-[#fce8e6] px-4 py-3 text-[14px] leading-[1.43] text-[#a61e1e]"
              >
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <span>{serverError}</span>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor={titleId}>Task Title</Label>
              <p
                id={titleHintId}
                className="text-[12px] leading-[1.3] text-[var(--apple-ink-muted-48)]"
              >
                Required. Up to 255 characters.
              </p>
              <Input
                ref={titleInputRef}
                id={titleId}
                name="title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (showDiscardConfirm) setShowDiscardConfirm(false);
                }}
                onBlur={handleTitleBlur}
                required
                maxLength={255}
                autoFocus
                aria-invalid={showTitleError ? 'true' : 'false'}
                aria-describedby={
                  showTitleError
                    ? `${titleHintId} ${titleErrorId}`
                    : titleHintId
                }
                className={showTitleError ? 'user-invalid-fallback' : undefined}
                placeholder="e.g., Ship v1 task management API"
              />
              {showTitleError ? (
                <p
                  id={titleErrorId}
                  className="flex items-center gap-1.5 text-[13px] leading-[1.35] text-[#c92a2a]"
                >
                  <span
                    role="img"
                    aria-label="Error"
                    className="inline-flex size-4 items-center justify-center rounded-full bg-[#c92a2a] text-[11px] font-semibold text-white"
                  >
                    !
                  </span>
                  <span>{titleValidationError}</span>
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={descId}>Description</Label>
              <p
                id={descHintId}
                className="text-[12px] leading-[1.3] text-[var(--apple-ink-muted-48)]"
              >
                Optional context, acceptance criteria, or notes.
              </p>
              <Textarea
                id={descId}
                name="description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (showDiscardConfirm) setShowDiscardConfirm(false);
                }}
                aria-invalid="false"
                aria-describedby={descHintId}
                placeholder="Add concise details so anyone can pick this up immediately..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={statusId}>Status</Label>
                <p className="text-[12px] leading-[1.3] text-[var(--apple-ink-muted-48)]">
                  Current workflow stage.
                </p>
                <Select
                  id={statusId}
                  name="status"
                  value={status}
                  items={statusItems}
                  onValueChange={(nextValue) => {
                    if (nextValue) {
                      setStatus(nextValue as TaskStatus);
                      if (showDiscardConfirm) setShowDiscardConfirm(false);
                    }
                  }}
                >
                  <SelectTrigger id={statusId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {TASK_STATUS_META[option].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={dueDateId}>Due Date</Label>
                <p
                  id={dueDateHintId}
                  className="text-[12px] leading-[1.3] text-[var(--apple-ink-muted-48)]"
                >
                  Optional local date and time.
                </p>
                <DateTimePicker
                  id={dueDateId}
                  value={dueDate}
                  onChange={(nextValue) => {
                    setDueDate(nextValue);
                    if (showDiscardConfirm) setShowDiscardConfirm(false);
                  }}
                  ariaDescribedBy={dueDateHintId}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <p
              id={discardNoticeId}
              className={`text-[13px] leading-[1.4] font-semibold text-[#a61e1e] ${
                showDiscardConfirm ? 'visible' : 'invisible'
              }`}
            >
              You have unsaved changes. Discard them to close this dialog?
            </p>
          </DialogBody>

          <DialogFooter>
            {showDiscardConfirm ? (
              <Button
                ref={discardButtonRef}
                type="button"
                variant="destructive-outline"
                size="sm"
                aria-describedby={discardNoticeId}
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onOpenChange(false);
                }}
              >
                Discard Changes
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleRequestClose(false)}
            >
              {showDiscardConfirm ? 'Keep Editing' : 'Cancel'}
            </Button>

            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  <span>{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
                </>
              ) : mode === 'create' ? (
                'Create Task'
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
