'use client';

import {
  AlertCircle,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  Table2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';
import { DeleteTaskDialog } from '@/components/tasks/delete-task-dialog';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskDetailDialog } from '@/components/tasks/task-detail-dialog';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { TASK_STATUS_META } from '@/components/tasks/task-status-badge';
import { TaskTable } from '@/components/tasks/task-table';
import { UpdateStatusDialog } from '@/components/tasks/update-status-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { useTaskSummaryQuery, useTasksQuery } from '@/services/task.service';
import {
  TASK_STATUSES,
  type FindAllTasksQuery,
  type SortOrder,
  type Task,
  type TaskSortField,
  type TaskStatus,
} from '@/types/task';

type StatusFilter = 'ALL' | TaskStatus;
type ViewMode = 'table' | 'cards';

const SORT_FIELD_OPTIONS: Array<{ value: TaskSortField; label: string }> = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

const SORT_FIELD_ITEMS = Object.fromEntries(
  SORT_FIELD_OPTIONS.map((item) => [item.value, item.label]),
);

const PAGE_SIZE_OPTIONS = [6, 9, 12, 24] as const;
const PAGE_SIZE_ITEMS = Object.fromEntries(
  PAGE_SIZE_OPTIONS.map((size) => [String(size), `${size} rows`]),
);

function parseStatusParam(raw: string | null): StatusFilter {
  if (raw && (TASK_STATUSES as readonly string[]).includes(raw)) {
    return raw as TaskStatus;
  }
  return 'ALL';
}

function parseSortFieldParam(raw: string | null): TaskSortField {
  const valid = SORT_FIELD_OPTIONS.some((item) => item.value === raw);
  return valid ? (raw as TaskSortField) : 'createdAt';
}

export function TaskFlowWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialStatus = parseStatusParam(searchParams.get('status'));
  const initialPage = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const initialSortBy = parseSortFieldParam(searchParams.get('sortBy'));
  const initialSortOrder: SortOrder =
    searchParams.get('sortOrder')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const initialSearch = searchParams.get('search') ?? '';

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState<number>(9);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<TaskSortField>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    task: Task | null;
  }>({ open: false, mode: 'create', task: null });
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const searchInputId = useId();
  const sortById = useId();
  const pageSizeId = useId();

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const syncUrlParams = useCallback(
    (next: {
      page?: number;
      status?: StatusFilter;
      sortBy?: TaskSortField;
      sortOrder?: SortOrder;
      search?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextPage = next.page ?? page;
      const nextStatus = next.status ?? statusFilter;
      const nextSortBy = next.sortBy ?? sortBy;
      const nextSortOrder = next.sortOrder ?? sortOrder;
      const nextSearch = (next.search ?? searchInput).trim();

      if (nextPage > 1) params.set('page', String(nextPage));
      else params.delete('page');

      if (nextStatus !== 'ALL') params.set('status', nextStatus);
      else params.delete('status');

      if (nextSortBy !== 'createdAt') params.set('sortBy', nextSortBy);
      else params.delete('sortBy');

      if (nextSortOrder !== 'DESC') params.set('sortOrder', nextSortOrder);
      else params.delete('sortOrder');

      if (nextSearch) params.set('search', nextSearch);
      else params.delete('search');

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      page,
      pathname,
      router,
      searchInput,
      searchParams,
      sortBy,
      sortOrder,
      statusFilter,
    ],
  );

  const queryParams: FindAllTasksQuery = {
    page,
    limit,
    sortBy,
    sortOrder,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: debouncedSearch.trim() || undefined,
  };

  const tasksQuery = useTasksQuery(queryParams);
  const summaryQuery = useTaskSummaryQuery();

  const tasks = tasksQuery.data?.data ?? [];
  const meta = tasksQuery.data?.meta ?? {
    page,
    limit,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const summary = summaryQuery.data ?? {
    total: meta.totalItems,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  const announce = useCallback((message: string) => {
    setLiveAnnouncement('');
    window.setTimeout(() => {
      setLiveAnnouncement(message);
    }, 30);
  }, []);

  const handleActionSuccess = useCallback(
    (message: string) => {
      announce(message);
    },
    [announce],
  );

  const handleStatusFilterChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
    syncUrlParams({ status: nextStatus, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
    syncUrlParams({ search: value, page: 1 });
  };

  const handleRefresh = () => {
    void Promise.all([tasksQuery.refetch(), summaryQuery.refetch()]);
    announce('Refreshing tasks.');
  };

  const openCreateModal = () => {
    setFormState({ open: true, mode: 'create', task: null });
  };

  const openEditModal = (task: Task) => {
    setFormState({ open: true, mode: 'edit', task });
  };

  const summaryCards: Array<{
    key: StatusFilter;
    label: string;
    value: number;
    caption: string;
  }> = [
    {
      key: 'ALL',
      label: 'All Tasks',
      value: summary.total,
      caption: 'Active workspace items',
    },
    {
      key: 'TODO',
      label: 'To Do',
      value: summary.todo,
      caption: 'Queued to start',
    },
    {
      key: 'IN_PROGRESS',
      label: 'In Progress',
      value: summary.inProgress,
      caption: 'Currently underway',
    },
    {
      key: 'DONE',
      label: 'Done',
      value: summary.done,
      caption: 'Completed milestones',
    },
  ];

  const activeStatusLabel =
    statusFilter === 'ALL'
      ? 'All Statuses'
      : TASK_STATUS_META[statusFilter].label;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--apple-canvas)] text-[var(--apple-ink)]">
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-full bg-[var(--apple-primary)] px-4 py-2 text-[14px] font-semibold text-white"
      >
        Skip to main content
      </a>

      <main className="flex-1">
        {/* Tile 1: Pure White Overview Tile (#ffffff) */}
        <section
          id="overview"
          className="w-full border-b border-[var(--apple-divider-soft)] bg-[var(--apple-canvas)] px-4 py-8 text-[var(--apple-ink)] sm:px-6 sm:py-10 lg:px-8"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1
                  id="main-content"
                  tabIndex={-1}
                  className="text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-[var(--apple-ink)]"
                >
                  TaskFlow
                </h1>
                <p className="mt-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[var(--apple-ink-muted-80)]">
                  Select a stage to filter your tasks below, or explore{' '}
                  <Link
                    href="/analytics"
                    className="text-[var(--apple-primary)] hover:underline"
                  >
                    detailed analytics
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {statusFilter !== 'ALL' ? (
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('ALL')}
                    className="inline-flex min-h-11 cursor-pointer items-center text-[15px] leading-[1.47] tracking-[-0.374px] text-[var(--apple-primary)] hover:underline"
                  >
                    Show all tasks
                  </button>
                ) : null}
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={openCreateModal}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  <span>New Task</span>
                </Button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((item) => {
                const isSelected = statusFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleStatusFilterChange(item.key)}
                    className={cn(
                      'flex min-h-[120px] cursor-pointer flex-col justify-between rounded-[18px] border p-5 text-left transition-all duration-150 active:scale-[0.98]',
                      isSelected
                        ? 'border-2 border-[var(--apple-primary)] bg-[var(--apple-primary)]/[0.04]'
                        : 'border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] hover:bg-[var(--apple-divider-soft)]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold tracking-[-0.224px] text-[var(--apple-ink-muted-80)]">
                        {item.label}
                      </span>
                      {isSelected ? (
                        <span className="rounded-full bg-[var(--apple-primary)]/10 px-2.5 py-0.5 text-[12px] font-semibold text-[var(--apple-primary)]">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      {summaryQuery.isPending && !summaryQuery.data ? (
                        <div
                          aria-hidden="true"
                          className="h-10 w-16 animate-pulse rounded-[8px] bg-[var(--apple-divider-soft)]"
                        />
                      ) : (
                        <p className="text-[38px] leading-none font-semibold tracking-[-0.02em] text-[var(--apple-ink)] tabular-nums">
                          {item.value}
                        </p>
                      )}
                      <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[var(--apple-ink-muted-48)]">
                        {item.caption}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tile 2: White Workspace Tile (#ffffff, shadcn Table + Cards Tabs) */}
        <section
          id="workspace"
          className="w-full rounded-none bg-[var(--apple-canvas)] px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="mx-auto max-w-[1440px] space-y-6">
            <Tabs
              value={viewMode}
              onValueChange={(val) => {
                if (val === 'table' || val === 'cards') {
                  setViewMode(val);
                }
              }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]">
                    Tasks
                  </h2>
                  <p className="mt-0.5 text-[14px] leading-[1.43] tracking-[-0.224px] text-[var(--apple-ink-muted-48)]">
                    Showing {tasks.length} of {meta.totalItems}{' '}
                    {meta.totalItems === 1 ? 'task' : 'tasks'}
                    {statusFilter !== 'ALL'
                      ? ` in ${TASK_STATUS_META[statusFilter].label}`
                      : ''}
                    .
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <TabsList aria-label="Choose view layout">
                    <TabsTrigger value="table">
                      <Table2 aria-hidden="true" />
                      <span>Table</span>
                    </TabsTrigger>
                    <TabsTrigger value="cards">
                      <LayoutGrid aria-hidden="true" />
                      <span>Cards</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Filter, Search, shadcn DropdownMenu & shadcn Select Toolbar */}
              <div className="flex flex-col gap-4 rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Apple Pill Search Input (44px height) */}
                  <div className="relative w-full lg:max-w-md">
                    <label htmlFor={searchInputId} className="visually-hidden">
                      Search tasks by title or description
                    </label>
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--apple-ink-muted-48)]"
                    />
                    <input
                      id={searchInputId}
                      type="search"
                      value={searchInput}
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      placeholder="Search tasks..."
                      className="h-11 w-full rounded-full border border-[rgb(0_0_0_/_0.08)] bg-[var(--apple-canvas-parchment)] py-2.5 pr-11 pl-11 text-[17px] leading-[1.47] font-normal tracking-[-0.374px] text-[var(--apple-ink)] placeholder:text-[var(--apple-ink-muted-48)]"
                    />
                    {searchInput ? (
                      <button
                        type="button"
                        aria-label="Clear search query"
                        onClick={() => handleSearchChange('')}
                        className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--apple-ink-muted-48)] hover:bg-[var(--apple-divider-soft)] hover:text-[var(--apple-ink)]"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    ) : null}
                  </div>

                  {/* Status DropdownMenu + Sort Select + Sort Direction */}
                  <div className="flex flex-wrap items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] px-4 py-2 text-[14px] leading-[1.29] tracking-[-0.224px] text-[var(--apple-ink)] transition-transform duration-150 hover:bg-[var(--apple-canvas-parchment)] active:scale-95">
                        <Filter aria-hidden="true" className="size-4 text-[var(--apple-primary)]" />
                        <span>Status: {activeStatusLabel}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={statusFilter}
                            onValueChange={(val) =>
                              handleStatusFilterChange(val as StatusFilter)
                            }
                          >
                            <DropdownMenuRadioItem value="ALL">
                              All Statuses
                            </DropdownMenuRadioItem>
                            {TASK_STATUSES.map((statusOption) => (
                              <DropdownMenuRadioItem
                                key={statusOption}
                                value={statusOption}
                              >
                                {TASK_STATUS_META[statusOption].label}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={sortById}
                        className="text-[14px] font-semibold tracking-[-0.224px] text-[var(--apple-ink-muted-80)]"
                      >
                        Sort
                      </label>
                      <div className="w-44">
                        <Select
                          id={sortById}
                          value={sortBy}
                          items={SORT_FIELD_ITEMS}
                          onValueChange={(nextVal) => {
                            if (nextVal) {
                              const nextSortBy = nextVal as TaskSortField;
                              setSortBy(nextSortBy);
                              setPage(1);
                              syncUrlParams({ sortBy: nextSortBy, page: 1 });
                            }
                          }}
                        >
                          <SelectTrigger id={sortById}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_FIELD_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={
                        sortOrder === 'DESC'
                          ? 'Sort descending. Switch to ascending'
                          : 'Sort ascending. Switch to descending'
                      }
                      onClick={() => {
                        const nextOrder: SortOrder =
                          sortOrder === 'DESC' ? 'ASC' : 'DESC';
                        setSortOrder(nextOrder);
                        setPage(1);
                        syncUrlParams({ sortOrder: nextOrder, page: 1 });
                      }}
                    >
                      {sortOrder === 'DESC' ? (
                        <>
                          <ArrowDownWideNarrow
                            aria-hidden="true"
                            className="size-4"
                          />
                          <span>Desc</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpNarrowWide
                            aria-hidden="true"
                            className="size-4"
                          />
                          <span>Asc</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Error State */}
              {tasksQuery.isError ? (
                <div
                  role="alert"
                  className="flex flex-col items-start justify-between gap-4 rounded-[18px] border border-[#c92a2a]/25 bg-[var(--apple-canvas)] p-6 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-[#c92a2a]"
                    />
                    <div className="space-y-1">
                      <h3 className="text-[17px] font-semibold tracking-[-0.374px] text-[var(--apple-ink)]">
                        Unable to load tasks
                      </h3>
                      <p className="text-[14px] leading-[1.43] text-[var(--apple-ink-muted-80)]">
                        {tasksQuery.error instanceof Error
                          ? tasksQuery.error.message
                          : 'An unexpected error occurred while contacting the API.'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                    <span>Try Again</span>
                  </Button>
                </div>
              ) : null}

              {/* Task Content (Loading / Empty / Table or Cards) */}
              {tasksQuery.isPending ? (
                <div
                  aria-label="Loading tasks"
                  className="space-y-3 rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] p-6"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-14 w-full rounded-[11px]"
                    />
                  ))}
                </div>
              ) : tasks.length === 0 && !tasksQuery.isError ? (
                <div className="flex flex-col items-center justify-center rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] px-6 py-16 text-center">
                  <h3 className="text-[21px] leading-[1.19] font-semibold tracking-[0.231px] text-[var(--apple-ink)]">
                    {debouncedSearch.trim() || statusFilter !== 'ALL'
                      ? 'No matching tasks found'
                      : 'Your workspace is clear'}
                  </h3>
                  <p className="mt-2 max-w-md text-[17px] leading-[1.47] tracking-[-0.374px] text-[var(--apple-ink-muted-48)]">
                    {debouncedSearch.trim() || statusFilter !== 'ALL'
                      ? 'Try adjusting your search keywords or switching back to all statuses.'
                      : 'Create your first task to start tracking progress across To Do, In Progress, and Done.'}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {debouncedSearch.trim() || statusFilter !== 'ALL' ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchInput('');
                          setStatusFilter('ALL');
                          setPage(1);
                          syncUrlParams({ search: '', status: 'ALL', page: 1 });
                        }}
                      >
                        Reset Filters
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={openCreateModal}
                    >
                      <Plus aria-hidden="true" className="size-4" />
                      <span>Create Task</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent
                    value="table"
                    className={
                      tasksQuery.isPlaceholderData ? 'opacity-70' : undefined
                    }
                  >
                    <TaskTable
                      tasks={tasks}
                      onView={(item) => setDetailTask(item)}
                      onChangeStatus={(item) => setStatusTask(item)}
                      onEdit={openEditModal}
                      onDelete={(item) => setDeleteTask(item)}
                    />
                  </TabsContent>

                  <TabsContent
                    value="cards"
                    className={
                      tasksQuery.isPlaceholderData ? 'opacity-70' : undefined
                    }
                  >
                    <ul
                      role="list"
                      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                    >
                      {tasks.map((task) => (
                        <li key={task.id} className="h-full">
                          <TaskCard
                            task={task}
                            onView={(item) => setDetailTask(item)}
                            onChangeStatus={(item) => setStatusTask(item)}
                            onEdit={openEditModal}
                            onDelete={(item) => setDeleteTask(item)}
                          />
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </>
              )}
            </Tabs>

            {/* Pagination Bar */}
            <nav
              aria-label="Pagination"
              className="flex flex-col items-center justify-between gap-4 rounded-[18px] border border-[var(--apple-hairline)] bg-[var(--apple-canvas)] px-5 py-4 sm:flex-row"
            >
              <div className="flex items-center gap-3">
                <label
                  htmlFor={pageSizeId}
                  className="text-[14px] tracking-[-0.224px] text-[var(--apple-ink-muted-48)]"
                >
                  Per page
                </label>
                <div className="w-28">
                  <Select
                    id={pageSizeId}
                    value={String(limit)}
                    items={PAGE_SIZE_ITEMS}
                    onValueChange={(nextVal) => {
                      if (nextVal) {
                        setLimit(Number(nextVal));
                        setPage(1);
                        syncUrlParams({ page: 1 });
                      }
                    }}
                  >
                    <SelectTrigger id={pageSizeId}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} rows
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage || tasksQuery.isPending}
                  onClick={() => {
                    const nextPage = Math.max(1, page - 1);
                    setPage(nextPage);
                    syncUrlParams({ page: nextPage });
                  }}
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                  <span>Previous</span>
                </Button>

                <span className="min-w-[110px] text-center text-[14px] font-semibold tracking-[-0.224px] text-[var(--apple-ink)] tabular-nums">
                  Page {meta.totalPages === 0 ? 0 : meta.page} of{' '}
                  {meta.totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage || tasksQuery.isPending}
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    syncUrlParams({ page: nextPage });
                  }}
                >
                  <span>Next</span>
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </nav>
          </div>
        </section>
      </main>

      <AppFooter />

      {/* Floating Bottom App Bar */}
      <AppHeader
        onNewTask={openCreateModal}
        onSync={handleRefresh}
        isSyncing={tasksQuery.isFetching}
      />

      <div aria-live="polite" aria-atomic="true" className="visually-hidden">
        {liveAnnouncement}
      </div>

      {/* Modal 1 & 2: Create / Edit Task Dialog (shadcn Dialog) */}
      <TaskFormDialog
        open={formState.open}
        mode={formState.mode}
        task={formState.task}
        onOpenChange={(nextOpen) =>
          setFormState((prev) => ({ ...prev, open: nextOpen }))
        }
        onSuccess={handleActionSuccess}
        onAnnounce={announce}
      />

      {/* Modal 3: Task Detail Dialog (shadcn Dialog) */}
      <TaskDetailDialog
        taskId={detailTask?.id ?? null}
        fallbackTask={detailTask}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailTask(null);
        }}
        onEdit={openEditModal}
        onChangeStatus={(item) => setStatusTask(item)}
        onDelete={(item) => setDeleteTask(item)}
      />

      {/* Modal 4: Status Change Dialog (shadcn Dialog) */}
      <UpdateStatusDialog
        task={statusTask}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setStatusTask(null);
        }}
        onSuccess={handleActionSuccess}
      />

      {/* Modal 5: Delete Confirmation AlertDialog (shadcn AlertDialog) */}
      <DeleteTaskDialog
        task={deleteTask}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTask(null);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
