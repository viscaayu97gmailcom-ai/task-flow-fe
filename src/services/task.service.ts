import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiFetch, buildQueryString } from '@/lib/api-client';
import type {
  ApiResponse,
  CreateTaskPayload,
  DeleteTaskData,
  FindAllTasksQuery,
  FindAllTasksResponse,
  Task,
  TaskStatus,
  TaskSummaryCounts,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '@/types/task';

const TASKS_ENDPOINT = '/v1/tasks';

/**
 * TanStack Query Key Factory for all TaskFlow queries.
 * Ensures deterministic cache keys and hierarchical invalidation.
 */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (query: FindAllTasksQuery = {}) =>
    [
      ...taskKeys.lists(),
      {
        page: query.page ?? 1,
        limit: query.limit ?? 9,
        sortBy: query.sortBy ?? 'createdAt',
        sortOrder: query.sortOrder ?? 'DESC',
        status: query.status ?? 'ALL',
        search: query.search?.trim() ?? '',
      },
    ] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  summary: () => [...taskKeys.all, 'summary'] as const,
};

/**
 * Low-level HTTP service functions calling task-flow-api (/v1/tasks).
 */
export const taskService = {
  findAll(
    query: FindAllTasksQuery = {},
    signal?: AbortSignal,
  ): Promise<FindAllTasksResponse> {
    const qs = buildQueryString({
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
      status: query.status,
      search: query.search?.trim() || undefined,
      sortBy: query.sortBy,
    });
    return apiFetch<FindAllTasksResponse>(`${TASKS_ENDPOINT}${qs}`, {
      method: 'GET',
      signal,
    });
  },

  findById(id: string, signal?: AbortSignal): Promise<ApiResponse<Task>> {
    return apiFetch<ApiResponse<Task>>(
      `${TASKS_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        signal,
      },
    );
  },

  create(payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    return apiFetch<ApiResponse<Task>>(TASKS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateTaskPayload): Promise<ApiResponse<Task>> {
    return apiFetch<ApiResponse<Task>>(
      `${TASKS_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  updateStatus(
    id: string,
    payload: UpdateTaskStatusPayload,
  ): Promise<ApiResponse<Task>> {
    return apiFetch<ApiResponse<Task>>(
      `${TASKS_ENDPOINT}/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  remove(id: string): Promise<ApiResponse<DeleteTaskData>> {
    return apiFetch<ApiResponse<DeleteTaskData>>(
      `${TASKS_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    );
  },

  async getSummary(signal?: AbortSignal): Promise<TaskSummaryCounts> {
    const [allRes, todoRes, inProgressRes, doneRes] = await Promise.all([
      taskService.findAll({ page: 1, limit: 1 }, signal),
      taskService.findAll({ page: 1, limit: 1, status: 'TODO' }, signal),
      taskService.findAll(
        { page: 1, limit: 1, status: 'IN_PROGRESS' },
        signal,
      ),
      taskService.findAll({ page: 1, limit: 1, status: 'DONE' }, signal),
    ]);

    return {
      total: allRes.meta.totalItems,
      todo: todoRes.meta.totalItems,
      inProgress: inProgressRes.meta.totalItems,
      done: doneRes.meta.totalItems,
    };
  },
};

/**
 * Reusable TanStack Query v5 queryOptions definitions.
 * Can be passed to useQuery(), queryClient.prefetchQuery(), or queryClient.ensureQueryData().
 */
export const taskQueryOptions = {
  list: (query: FindAllTasksQuery = {}) =>
    queryOptions({
      queryKey: taskKeys.list(query),
      queryFn: ({ signal }) => taskService.findAll(query, signal),
      placeholderData: keepPreviousData,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: taskKeys.detail(id),
      queryFn: ({ signal }) => taskService.findById(id, signal),
      enabled: Boolean(id),
    }),

  summary: () =>
    queryOptions({
      queryKey: taskKeys.summary(),
      queryFn: ({ signal }) => taskService.getSummary(signal),
    }),
};

/**
 * TanStack Query hooks for reading and mutating tasks.
 */
export function useTasksQuery(query: FindAllTasksQuery = {}) {
  return useQuery(taskQueryOptions.list(query));
}

export function useTaskSummaryQuery() {
  return useQuery(taskQueryOptions.summary());
}

export function useTaskDetailQuery(id: string | null) {
  return useQuery({
    ...taskQueryOptions.detail(id ?? ''),
    enabled: Boolean(id),
  });
}

export function usePrefetchTaskDetail() {
  const queryClient = useQueryClient();

  return (id: string) => {
    void queryClient.prefetchQuery(taskQueryOptions.detail(id));
  };
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...taskKeys.all, 'create'] as const,
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(taskKeys.detail(response.data.id), response);
      await queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...taskKeys.all, 'update'] as const,
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      taskService.update(id, payload),
    onSuccess: async (response, { id }) => {
      queryClient.setQueryData(taskKeys.detail(id), response);
      await queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...taskKeys.all, 'update-status'] as const,
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateStatus(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousLists = queryClient.getQueriesData<FindAllTasksResponse>({
        queryKey: taskKeys.lists(),
      });

      for (const [key, snapshot] of previousLists) {
        if (!snapshot) continue;
        queryClient.setQueryData<FindAllTasksResponse>(key, {
          ...snapshot,
          data: snapshot.data.map((task) =>
            task.id === id ? { ...task, status } : task,
          ),
        });
      }

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      if (!context?.previousLists) return;
      for (const [key, snapshot] of context.previousLists) {
        queryClient.setQueryData(key, snapshot);
      }
    },
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(taskKeys.detail(id), response);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...taskKeys.all, 'delete'] as const,
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: async (_response, id) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
