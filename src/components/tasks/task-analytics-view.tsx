'use client';

import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import {
  TASK_STATUS_META,
  TaskStatusBadge,
} from '@/components/tasks/task-status-badge';
import { UpdateStatusDialog } from '@/components/tasks/update-status-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate, isTaskOverdue } from '@/lib/format-date';
import {
  usePrefetchTaskDetail,
  useTaskSummaryQuery,
  useTasksQuery,
} from '@/services/task.service';
import { TASK_STATUSES, type Task } from '@/types/task';

export function TaskAnalyticsView() {
  const summaryQuery = useTaskSummaryQuery();
  const tasksQuery = useTasksQuery({
    page: 1,
    limit: 50,
    sortBy: 'dueDate',
    sortOrder: 'ASC',
  });
  const prefetchDetail = usePrefetchTaskDetail();

  const [createOpen, setCreateOpen] = useState(false);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setLiveAnnouncement('');
    window.setTimeout(() => {
      setLiveAnnouncement(message);
    }, 30);
  }, []);

  const summary = summaryQuery.data ?? {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  const completionRate =
    summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;

  const allTasks = tasksQuery.data?.data ?? [];
  const overdueTasks = allTasks.filter((task) =>
    isTaskOverdue(task.dueDate, task.status),
  );
  const upcomingTasks = allTasks
    .filter(
      (task) =>
        task.status !== 'DONE' &&
        task.dueDate !== null &&
        !isTaskOverdue(task.dueDate, task.status),
    )
    .slice(0, 6);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--apple-canvas)] text-[var(--apple-ink)]">
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-full bg-[var(--apple-primary)] px-4 py-2 text-[14px] font-semibold text-white"
      >
        Skip to main content
      </a>

      <main className="flex-1">
        {/* Tile 1: White Completion Rate & Distribution Tile (#ffffff) */}
        <section className="w-full border-b border-[var(--apple-divider-soft)] bg-[var(--apple-canvas)] px-4 py-10 text-[var(--apple-ink)] sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-[1440px] space-y-6">
            <div>
              <h1
                id="main-content"
                tabIndex={-1}
                className="text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-[var(--apple-ink)]"
              >
                Analytics &amp; Insights
              </h1>
              <p className="mt-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[var(--apple-ink-muted-80)]">
                Real-time completion rate, stage distribution, and schedule
                alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="flex flex-col justify-between rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] p-6">
                <span className="text-[14px] font-semibold tracking-[-0.224px] text-[var(--apple-ink-muted-80)]">
                  Completion Rate
                </span>
                <div className="mt-4">
                  <p className="text-[48px] leading-none font-semibold tracking-[-0.02em] text-[var(--apple-ink)] tabular-nums">
                    {completionRate}%
                  </p>
                  <p className="mt-2 text-[14px] text-[var(--apple-ink-muted-48)]">
                    {summary.done} of {summary.total} tasks completed
                  </p>
                </div>
              </div>

              {TASK_STATUSES.map((statusKey) => {
                const count =
                  statusKey === 'TODO'
                    ? summary.todo
                    : statusKey === 'IN_PROGRESS'
                      ? summary.inProgress
                      : summary.done;
                const pct =
                  summary.total > 0
                    ? Math.round((count / summary.total) * 100)
                    : 0;
                const meta = TASK_STATUS_META[statusKey];

                return (
                  <div
                    key={statusKey}
                    className="flex flex-col justify-between rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[var(--apple-ink-muted-80)]">
                        {meta.label}
                      </span>
                      <span className="text-[14px] font-semibold text-[var(--apple-ink)] tabular-nums">
                        {pct}%
                      </span>
                    </div>

                    <div className="my-4">
                      <p className="text-[36px] leading-none font-semibold text-[var(--apple-ink)] tabular-nums">
                        {count}
                      </p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--apple-divider-soft)]">
                        <div
                          className="h-full rounded-full bg-[var(--apple-primary)] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/?status=${statusKey}`}
                      className="inline-flex items-center gap-1 text-[14px] text-[var(--apple-primary)] hover:underline"
                    >
                      <span>Filter board by {meta.label}</span>
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tile 2: White Overdue & Upcoming Deadlines Tile (#ffffff) */}
        <section className="w-full rounded-none bg-[var(--apple-canvas)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Overdue Tasks Column */}
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-[21px]">
                    <AlertTriangle
                      aria-hidden="true"
                      className="size-5 text-[#c92a2a]"
                    />
                    <span>Overdue Tasks ({overdueTasks.length})</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {tasksQuery.isPending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : overdueTasks.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-[11px] bg-[var(--apple-canvas-parchment)] p-4 text-[14px] text-[var(--apple-ink-muted-80)]">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-4 text-[var(--apple-primary)]"
                    />
                    <span>No overdue tasks. Everything is on schedule.</span>
                  </div>
                ) : (
                  <ul
                    role="list"
                    className="divide-y divide-[var(--apple-divider-soft)]"
                  >
                    {overdueTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-4 py-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/tasks/${task.id}`}
                            onMouseEnter={() => prefetchDetail(task.id)}
                            onFocus={() => prefetchDetail(task.id)}
                            className="block truncate text-[17px] font-semibold text-[var(--apple-ink)] hover:text-[var(--apple-primary)]"
                          >
                            {task.title}
                          </Link>
                          <p className="mt-0.5 text-[12px] text-[#c92a2a]">
                            Due {formatShortDate(task.dueDate)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="pearl"
                          size="compact"
                          onClick={() => setStatusTask(task)}
                        >
                          Update Status
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines Column */}
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-[21px]">
                    <Calendar
                      aria-hidden="true"
                      className="size-5 text-[var(--apple-primary)]"
                    />
                    <span>Upcoming Deadlines</span>
                  </CardTitle>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="compact"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  <span>Add Task</span>
                </Button>
              </CardHeader>
              <CardContent>
                {tasksQuery.isPending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : upcomingTasks.length === 0 ? (
                  <p className="rounded-[11px] bg-[var(--apple-canvas-parchment)] p-4 text-[14px] text-[var(--apple-ink-muted-80)]">
                    No upcoming scheduled tasks with due dates.
                  </p>
                ) : (
                  <ul
                    role="list"
                    className="divide-y divide-[var(--apple-divider-soft)]"
                  >
                    {upcomingTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-4 py-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/tasks/${task.id}`}
                            onMouseEnter={() => prefetchDetail(task.id)}
                            onFocus={() => prefetchDetail(task.id)}
                            className="block truncate text-[17px] font-semibold text-[var(--apple-ink)] hover:text-[var(--apple-primary)]"
                          >
                            {task.title}
                          </Link>
                          <p className="mt-0.5 text-[12px] text-[var(--apple-ink-muted-48)]">
                            Due {formatShortDate(task.dueDate)}
                          </p>
                        </div>
                        <TaskStatusBadge status={task.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <AppFooter />

      <AppHeader
        onNewTask={() => setCreateOpen(true)}
        onSync={() => {
          void Promise.all([summaryQuery.refetch(), tasksQuery.refetch()]);
          announce('Refreshing analytics.');
        }}
        isSyncing={summaryQuery.isFetching || tasksQuery.isFetching}
      />

      <div aria-live="polite" aria-atomic="true" className="visually-hidden">
        {liveAnnouncement}
      </div>

      <TaskFormDialog
        open={createOpen}
        mode="create"
        task={null}
        onOpenChange={setCreateOpen}
        onSuccess={announce}
        onAnnounce={announce}
      />

      <UpdateStatusDialog
        task={statusTask}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setStatusTask(null);
        }}
        onSuccess={announce}
      />
    </div>
  );
}
