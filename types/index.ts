// ──────────────────────────────────────────
// Generic utility types
// ──────────────────────────────────────────

/** Make specific keys of T required */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/** Make specific keys of T optional */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Extract the value type of a promise */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** A standard API response envelope */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ──────────────────────────────────────────
// App-specific types (extend as needed)
// ──────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

export type Status = "idle" | "loading" | "success" | "error";
