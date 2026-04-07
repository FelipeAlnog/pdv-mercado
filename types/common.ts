export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface DashboardStats {
  totalSalesToday: number;
  totalRevenuToday: number;
  totalProducts: number;
  lowStockProducts: number;
}
