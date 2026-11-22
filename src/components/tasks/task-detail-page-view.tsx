'use client';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';
import { DeleteTaskDialog } from '@/components/tasks/delete-task-dialog';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import {
  TASK_STATUS_META,
  TaskStatusBadge,
} from '@/components/tasks/task-status-badge';
import { UpdateStatusDialog } from '@/components/tasks/update-status-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, isTaskOverdue } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { useTaskDetailQuery } from '@/services/task.service';
import { TASK_STATUSES, type Task } from '@/types/task';

export function TaskDetailPageView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = typeof params.id === 'string' ? params.id : '';

  const detailQuery = useTaskDetailQuery(taskId || null);
  const task = detailQuery.data?.data ?? null;

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setLiveAnnouncement('');
    window.setTimeout(() => {
      setLiveAnnouncement(message);
    }, 30);
  }, []);

  const handleSuccess = useCallback(
    (message: string) => {
      announce(message);
    },
    [announce],
  );

  const overdue = task ? isTaskOverdue(task.dueDate, task.status) : false;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--apple-canvas)] text-[var(--apple-ink)]">
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-full bg-[var(--apple-primary)] px-4 py-2 text-[14px] font-semibold text-white"
      >
        Skip to main content
      </a>

      <AppHeader
        onNewTask={() => setCreateOpen(true)}
        onSync={() => {
          void detailQuery.refetch();
          announce('Refreshing task detail.');
        }}
        isSyncing={detailQuery.isFetching}
      />

      <main className="flex-1">
        {/* Top Light Tile: Breadcrumb & Task Hero */}
        <section className="w-full rounded-none bg-[var(--apple-canvas)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-[980px] space-y-6">
            <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-1.5 text-[14px] leading-[1.29] tracking-[-0.224px] text-[var(--apple-primary)] hover:underline"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                <span>Back to Workspace</span>
              </Link>
            </nav>

            {detailQuery.isPending ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : detailQuery.isError || !task ? (
              <div
                role="alert"
                className="space-y-4 rounded-[18px] border border-[#c92a2a]/25 bg-[var(--apple-canvas-parchment)] p-8"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-[#c92a2a]"
                  />
                  <div className="space-y-1">
                    <h1
                      id="main-content"
                      tabIndex={-1}
                      className="text-[24px] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]"
                    >
                      Task not available
                    </h1>
                    <p className="text-[17px] leading-[1.47] text-[var(--apple-ink-muted-80)]">
                      {detailQuery.error instanceof Error
                        ? detailQuery.error.message
                        : 'The requested task could not be found.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      void detailQuery.refetch();
                    }}
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                    <span>Retry</span>
                  </Button>
                  <Link
                    href="/"
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] px-5 py-2 text-[14px] text-[var(--apple-ink)] hover:bg-[var(--apple-divider-soft)]"
                  >
                    Return to Workspace
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <TaskStatusBadge status={task.status} />
                  {overdue ? <Badge variant="overdue">Overdue</Badge> : null}
                  <span className="font-mono text-[12px] text-[var(--apple-ink-muted-48)]">
                    ID: {task.id}
                  </span>
                </div>

                <h1
                  id="main-content"
                  tabIndex={-1}
                  className="text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--apple-ink)]"
                >
                  {task.title}
                </h1>

                <p className="whitespace-pre-wrap text-[17px] leading-[1.47] font-normal tracking-[-0.374px] text-[var(--apple-ink-muted-80)]">
                  {task.description?.trim()
                    ? task.description
                    : 'No detailed description has been added to this task yet. Use Edit Task to document context or requirements.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    <span>Edit Task</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatusTask(task)}
                  >
                    <SlidersHorizontal aria-hidden="true" className="size-4" />
                    <span>Change Status</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive-outline"
                    size="sm"
                    onClick={() => setDeleteTask(task)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    <span>Delete Task</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tile 2: White Workflow Pipeline Tile (#ffffff) */}
        {task ? (
          <section className="w-full border-y border-[var(--apple-divider-soft)] bg-[var(--apple-canvas)] px-4 py-12 text-[var(--apple-ink)] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[980px] space-y-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]">
                    Workflow Stage
                  </h2>
                  <p className="text-[14px] leading-[1.43] text-[var(--apple-ink-muted-80)]">
                    Click the status button to transition this task through the pipeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusTask(task)}
                  className="inline-flex min-h-11 cursor-pointer items-center text-[14px] text-[var(--apple-primary)] hover:underline"
                >
                  Open status selector
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {TASK_STATUSES.map((stage, idx) => {
                  const meta = TASK_STATUS_META[stage];
                  const isCurrent = task.status === stage;

                  return (
                    <button
                      key={stage}
                      type="button"
                      aria-pressed={isCurrent}
                      onClick={() => setStatusTask(task)}
                      className={cn(
                        'flex min-h-[112px] cursor-pointer flex-col justify-between rounded-[18px] border p-5 text-left transition-all duration-150 active:scale-[0.98]',
                        isCurrent
                          ? 'border-2 border-[var(--apple-primary)] bg-[var(--apple-primary)]/[0.04]'
                          : 'border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] hover:bg-[var(--apple-divider-soft)]',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[var(--apple-ink-muted-48)]">
                          Stage 0{idx + 1}
                        </span>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--apple-primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--apple-primary)]">
                            <Check aria-hidden="true" className="size-3" />
                            <span>Current</span>
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <p className="text-[17px] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]">
                          {meta.label}
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--apple-ink-muted-80)]">
                          {meta.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* Tile 3: White Metadata & Audit Tile (#ffffff) */}
        {task ? (
          <section className="w-full rounded-none bg-[var(--apple-canvas)] px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[980px] space-y-6">
              <h2 className="text-[21px] leading-[1.19] font-semibold tracking-[0.231px] text-[var(--apple-ink)]">
                Specifications &amp; Timestamps
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[14px] text-[var(--apple-ink-muted-48)]">
                      <Calendar aria-hidden="true" className="size-4" />
                      <span>Due Date</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[17px] font-semibold text-[var(--apple-ink)]">
                      {task.dueDate
                        ? formatDateTime(task.dueDate)
                        : 'No deadline set'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[14px] text-[var(--apple-ink-muted-48)]">
                      <Clock aria-hidden="true" className="size-4" />
                      <span>Created At</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[17px] font-semibold text-[var(--apple-ink)]">
                      {formatDateTime(task.createdAt)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[14px] text-[var(--apple-ink-muted-48)]">
                      <Clock aria-hidden="true" className="size-4" />
                      <span>Last Updated</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[17px] font-semibold text-[var(--apple-ink)]">
                      {formatDateTime(task.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <AppFooter />

      <div aria-live="polite" aria-atomic="true" className="visually-hidden">
        {liveAnnouncement}
      </div>

      {/* Create New Task Modal */}
      <TaskFormDialog
        open={createOpen}
        mode="create"
        task={null}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
        onAnnounce={announce}
      />

      {/* Edit Current Task Modal */}
      <TaskFormDialog
        open={editOpen}
        mode="edit"
        task={task}
        onOpenChange={setEditOpen}
        onSuccess={handleSuccess}
        onAnnounce={announce}
      />

      {/* Update Status Modal */}
      <UpdateStatusDialog
        task={statusTask}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setStatusTask(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal -> redirects back to / on success */}
      <DeleteTaskDialog
        task={deleteTask}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTask(null);
        }}
        onSuccess={(message) => {
          announce(message);
          router.push('/');
        }}
      />
    </div>
  );
}
