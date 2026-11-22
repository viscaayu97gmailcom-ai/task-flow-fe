
import type {
  ApiResponse,
  PaginationMeta,
  SortOrder,
} from './task';

export const EVENT_STATUSES = [
  'PLANNED',
  'ONGOING',
  'COMPLETED',
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type EventSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'startDate'
  | 'endDate'
  | 'name'
  | 'status';

export interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  participants?: Participant[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FindAllEventsQuery {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  status?: EventStatus;
  search?: string;
  sortBy?: EventSortField;
}

export interface CreateEventPayload {
  name: string;
  description?: string | null;
  location: string;
  startDate: string;
  endDate: string;
  status?: EventStatus;
}

export interface UpdateEventPayload {
  name?: string;
  description?: string | null;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
}

export interface FindAllEventsResponse extends ApiResponse<Event[]> {
  meta: PaginationMeta;
}

export interface DeleteEventData {
  id: string;
  deleted: boolean;
}

export interface EventSummaryCounts {
  total: number;
  planned: number;
  ongoing: number;
  completed: number;
  totalParticipants: number;
}
