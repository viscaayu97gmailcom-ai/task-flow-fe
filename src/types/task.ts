export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'dueDate'
  | 'title'
  | 'status';

export type SortOrder = 'ASC' | 'DESC';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FindAllTasksQuery {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  status?: TaskStatus;
  search?: string;
  sortBy?: TaskSortField;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface FindAllTasksResponse extends ApiResponse<Task[]> {
  meta: PaginationMeta;
}

export interface DeleteTaskData {
  id: string;
  deleted: boolean;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  path?: string;
  timestamp?: string;
}

export interface TaskSummaryCounts {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}
