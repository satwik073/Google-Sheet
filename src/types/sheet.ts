//@ts-nocheck
export interface CellData {
  value: string;
  formula: string;
  style: CellStyle;
}

export interface SheetState {
  cells: Record<string, CellData>;
  selectedCell: string | null;
  selectedRange: string[] | null;
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  canUndo: boolean;
  canRedo: boolean;
}

export interface CellStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
}
export type CellPosition = {
  row: number;
  col: number;
};