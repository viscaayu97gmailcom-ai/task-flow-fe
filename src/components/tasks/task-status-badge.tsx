import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types/task';

export const TASK_STATUS_META: Record<
  TaskStatus,
  {
    label: string;
    description: string;
    variant: 'subtle' | 'active' | 'dark';
  }
> = {
  TODO: {
    label: 'To Do',
    description: 'Queued and ready to start',
    variant: 'subtle',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Actively being worked on',
    variant: 'active',
  },
  DONE: {
    label: 'Done',
    description: 'Completed and verified',
    variant: 'dark',
  },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const meta = TASK_STATUS_META[status];

  return (
    <Badge variant={meta.variant}>
      {status === 'TODO' ? (
        <Circle aria-hidden="true" className="size-3.5" />
      ) : status === 'IN_PROGRESS' ? (
        <Clock aria-hidden="true" className="size-3.5" />
      ) : (
        <CheckCircle2 aria-hidden="true" className="size-3.5" />
      )}
      <span>{meta.label}</span>
    </Badge>
  );
}
