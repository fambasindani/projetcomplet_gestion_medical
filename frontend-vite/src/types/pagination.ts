// types/pagination.ts
export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPageUrl?: string;
  nextPageUrl?: string;
}

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
}