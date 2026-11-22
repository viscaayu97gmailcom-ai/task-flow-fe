
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { apiFetch, buildQueryString } from '@/lib/api-client';

import type { ApiResponse } from '@/types/task';

import type {
  DeleteEventData,
  Event,
  CreateEventPayload,
  UpdateEventPayload,
  FindAllEventsQuery,
  FindAllEventsResponse,
} from '@/types/event';

const EVENTS_ENDPOINT = '/v1/events';

/**
 * TanStack Query Key Factory
 */
export const eventKeys = {
  all: ['events'] as const,

  lists: () => [...eventKeys.all, 'list'] as const,

  list: (query: FindAllEventsQuery = {}) =>
    [
      ...eventKeys.lists(),
      {
        page: query.page ?? 1,
        limit: query.limit ?? 9,
        sortBy: query.sortBy ?? 'createdAt',
        sortOrder: query.sortOrder ?? 'DESC',
        status: query.status ?? 'ALL',
        search: query.search?.trim() ?? '',
      },
    ] as const,

  details: () => [...eventKeys.all, 'detail'] as const,

  detail: (id: string) => [...eventKeys.details(), id] as const,
};

/**
 * HTTP service functions for Event Management.
 */
export const eventService = {
  findAll(
    query: FindAllEventsQuery = {},
    signal?: AbortSignal,
  ): Promise<FindAllEventsResponse> {
    const qs = buildQueryString({
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
      status: query.status,
      search: query.search?.trim() || undefined,
      sortBy: query.sortBy,
    });

    return apiFetch<FindAllEventsResponse>(
      `${EVENTS_ENDPOINT}${qs}`,
      {
        method: 'GET',
        signal,
      },
    );
  },

  findById(
    id: string,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Event>> {
    return apiFetch<ApiResponse<Event>>(
      `${EVENTS_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        signal,
      },
    );
  },

  create(
    payload: CreateEventPayload,
  ): Promise<ApiResponse<Event>> {
    return apiFetch<ApiResponse<Event>>(EVENTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(
    id: string,
    payload: UpdateEventPayload,
  ): Promise<ApiResponse<Event>> {
    return apiFetch<ApiResponse<Event>>(
      `${EVENTS_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  remove(
    id: string,
  ): Promise<ApiResponse<DeleteEventData>> {
    return apiFetch<ApiResponse<DeleteEventData>>(
      `${EVENTS_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    );
  },
};

/**
 * Reusable TanStack Query options.
 */
export const eventQueryOptions = {
  list: (query: FindAllEventsQuery = {}) =>
    queryOptions({
      queryKey: eventKeys.list(query),
      queryFn: ({ signal }) =>
        eventService.findAll(query, signal),
      placeholderData: keepPreviousData,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: eventKeys.detail(id),
      queryFn: ({ signal }) =>
        eventService.findById(id, signal),
      enabled: Boolean(id),
    }),
};

/**
 * Read hooks.
 */
export function useEventsQuery(
  query: FindAllEventsQuery = {},
) {
  return useQuery(eventQueryOptions.list(query));
}

export function useEventDetailQuery(id: string | null) {
  return useQuery({
    ...eventQueryOptions.detail(id ?? ''),
    enabled: Boolean(id),
  });
}

export function usePrefetchEventDetail() {
  const queryClient = useQueryClient();

  return (id: string) => {
    void queryClient.prefetchQuery(
      eventQueryOptions.detail(id),
    );
  };
}

/**
 * Create event mutation.
 */
export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...eventKeys.all, 'create'] as const,

    mutationFn: (payload: CreateEventPayload) =>
      eventService.create(payload),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        eventKeys.detail(response.data.id),
        response,
      );

      await queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });
}

/**
 * Update event mutation.
 */
export function useUpdateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...eventKeys.all, 'update'] as const,

    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEventPayload;
    }) => eventService.update(id, payload),

    onSuccess: async (response, { id }) => {
      queryClient.setQueryData(
        eventKeys.detail(id),
        response,
      );

      await queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });
}

/**
 * Delete event mutation.
 */
export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...eventKeys.all, 'delete'] as const,

    mutationFn: (id: string) =>
      eventService.remove(id),

    onSuccess: async (_response, id) => {
      queryClient.removeQueries({
        queryKey: eventKeys.detail(id),
      });

      await queryClient.invalidateQueries({
        queryKey: eventKeys.all,
      });
    },
  });
}
