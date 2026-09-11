export interface DataState {
  rows: Record<string, string | number>[];
  schema: string;
  sample: string;
  fileName: string;
  rowCount: number;
  columns: string[];
  tableName: string;
}
