// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// File Paths
export const FILE_PATHS = {
  OUTPUTS: 'src/outputs',
  JSON_OUTPUT: 'src/outputs/json',
  TXT_OUTPUT: 'src/outputs/txt',
  FRONT_OUTPUT: 'src/outputs/front',
} as const;

// Status Colors for Dashboard
export const STATUS_COLORS = {
  'Open / Ready for sprint': '#2196f3',
  'Develop in progress': '#ff9800',
  'To be tested': '#9c27b0',
  'Ready for smoke test': '#607d8b',
  'QA-tests failed': '#f44336',
  'Done': '#4caf50',
  'In QA / UX Test': '#e91e63',
} as const;

// Status Classes for CSS
export const STATUS_CLASSES = {
  'Open / Ready for sprint': 'open-ready',
  'Develop in progress': 'develop-in-progress',
  'To be tested': 'to-be-tested',
  'Ready for smoke test': 'ready-smoke',
  'QA-tests failed': 'qa-failed',
  'Done': 'done',
  'In QA / UX Test': 'in-qa',
} as const;

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  ITEMS_PER_PAGE: 50,
  SEARCH_DEBOUNCE: 300,
  CHART_COLORS: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
} as const; 