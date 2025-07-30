// Re-export all types from individual files
export * from './consulta_sprint.interface';
export * from './consulta_status.interface';
export * from './historial-json.interface';

// Common types used across the project
export type StatusType = 
  | 'Open / Ready for sprint'
  | 'Develop in progress'
  | 'To be tested'
  | 'Ready for smoke test'
  | 'QA-tests failed'
  | 'Done'
  | 'In QA / UX Test';

export type Environment = 'development' | 'production' | 'test';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface FilterParams {
  status?: StatusType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardStats {
  totalUserStories: number;
  completedUserStories: number;
  inProgressUserStories: number;
  averageAge: number;
  completionRate: number;
}

export interface TimelineItem {
  id: number;
  status: StatusType;
  date: Date;
  isFirst: boolean;
  isLast: boolean;
} 