export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error' | 'warning';
  message?: string;
  meta: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
  errors?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedServiceResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ServiceResponse<T> {
  data: T;
}
