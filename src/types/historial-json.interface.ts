/**
 * Interfaz para el historial JSON de user stories
 */
export interface HistorialEntry {
  created_date: string;
  modified_date: string;
  name: string;
  ref: number;
  subject: string;
  status?: string;
}

/**
 * Tipo para el array de historial
 */
export type HistorialJSON = HistorialEntry[]; 