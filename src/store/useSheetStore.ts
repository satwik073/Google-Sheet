import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SheetState, CellData, CellStyle } from '../types/sheet';
import { evaluateFormula } from '../utils/formulas';

const DEFAULT_CELL_STYLE: CellStyle = {
  bold: false,
  italic: false,
  fontSize: 14,
  color: '#000000',
  backgroundColor: '#ffffff',
  textAlign: 'left',
  fontFamily: 'Arial, sans-serif',
};

export interface SheetStore extends SheetState {
  setCellValue: (cellId: string, value: string) => void;
  setCellFormula: (cellId: string, formula: string) => void;
  setCellStyle: (cellId: string, style: Partial<CellStyle>) => void;
  setSelectedCell: (cellId: string | null) => void;
  setSelectedRange: (range: string[] | null) => void;
  setColumnWidth: (colId: string, width: number) => void;
  setRowHeight: (rowId: string, height: number) => void;
  undoAction: () => void;
  redoAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  findAndReplace: (findText: string, replaceText: string) => void;
}

// Create a history stack implementation outside the store
type HistoryState = {
  cells: Record<string, CellData>;
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
};

export const useSheetStore = create<SheetStore>()(
  immer((set, get) => {
    // Initialize history stacks
    const undoStack: HistoryState[] = [];
    const redoStack: HistoryState[] = [];
    
    // Helper to save current state to history
    const saveToHistory = () => {
      const { cells, columnWidths, rowHeights } = get();
      undoStack.push({
        cells: JSON.parse(JSON.stringify(cells)),
        columnWidths: JSON.parse(JSON.stringify(columnWidths)),
        rowHeights: JSON.parse(JSON.stringify(rowHeights))
      });
      // Clear redo stack when a new action is performed
      redoStack.length = 0;
      set(state => {
        state.canUndo = undoStack.length > 0;
        state.canRedo = redoStack.length > 0;
      });
    };

    return {
      cells: {},
      selectedCell: null,
      selectedRange: null,
      columnWidths: {},
      rowHeights: {},
      canUndo: false,
      canRedo: false,

      setCellValue: (cellId, value) => {
        // Save current state before making changes
        saveToHistory();

        set(state => {
          if (!state.cells[cellId]) {
            state.cells[cellId] = {
              value: '',
              formula: '',
              style: { ...DEFAULT_CELL_STYLE },
            };
          }
          state.cells[cellId].value = value;
          state.cells[cellId].formula = '';
        });
      },

      setCellFormula: (cellId, formula) => {
        // Save current state before making changes
        saveToHistory();

        set(state => {
          if (!state.cells[cellId]) {
            state.cells[cellId] = {
              value: '',
              formula: '',
              style: { ...DEFAULT_CELL_STYLE },
            };
          }
          state.cells[cellId].formula = formula;
          state.cells[cellId].value = evaluateFormula(formula, state.cells);
        });
      },

      setCellStyle: (cellId, style) => {
        // Save current state before making changes
        saveToHistory();

        set(state => {
          if (!state.cells[cellId]) {
            state.cells[cellId] = {
              value: '',
              formula: '',
              style: { ...DEFAULT_CELL_STYLE },
            };
          }
          state.cells[cellId].style = { ...state.cells[cellId].style, ...style };
        });
      },

      setSelectedCell: (cellId) =>
        set(state => {
          state.selectedCell = cellId;
        }),

      setSelectedRange: (range) =>
        set(state => {
          state.selectedRange = range;
        }),

      setColumnWidth: (colId, width) => {
        // Save current state before making changes
        saveToHistory();

        set(state => {
          state.columnWidths[colId] = width;
        });
      },

      setRowHeight: (rowId, height) => {
        // Save current state before making changes
        saveToHistory();

        set(state => {
          state.rowHeights[rowId] = height;
        });
      },

      undoAction: () => {
        if (undoStack.length === 0) return;

        // Save current state to redo stack
        const currentState = get();
        redoStack.push({
          cells: JSON.parse(JSON.stringify(currentState.cells)),
          columnWidths: JSON.parse(JSON.stringify(currentState.columnWidths)),
          rowHeights: JSON.parse(JSON.stringify(currentState.rowHeights))
        });

        // Get the previous state from undo stack
        const previousState = undoStack.pop()!;

        // Apply the previous state
        set(state => {
          state.cells = previousState.cells;
          state.columnWidths = previousState.columnWidths;
          state.rowHeights = previousState.rowHeights;
          state.canUndo = undoStack.length > 0;
          state.canRedo = true;
        });
      },

      redoAction: () => {
        if (redoStack.length === 0) return;

        // Save current state to undo stack
        const currentState = get();
        undoStack.push({
          cells: JSON.parse(JSON.stringify(currentState.cells)),
          columnWidths: JSON.parse(JSON.stringify(currentState.columnWidths)),
          rowHeights: JSON.parse(JSON.stringify(currentState.rowHeights))
        });

        // Get the next state from redo stack
        const nextState = redoStack.pop()!;

        // Apply the next state
        set(state => {
          state.cells = nextState.cells;
          state.columnWidths = nextState.columnWidths;
          state.rowHeights = nextState.rowHeights;
          state.canUndo = true;
          state.canRedo = redoStack.length > 0;
        });
      },

      findAndReplace: (findText, replaceText) => {
        if (!findText) return;
        
        // Save current state before making changes
        saveToHistory();
        
        let changesMade = false;
        
        set(state => {
          Object.keys(state.cells).forEach(cellId => {
            const cell = state.cells[cellId];
            
            // Replace in value
            if (cell.value && cell.value.includes(findText)) {
              cell.value = cell?.value?.replaceAll(findText, replaceText);
              changesMade = true;
            }
            
            // Replace in formula
            if (cell.formula && cell.formula.includes(findText)) {
              const newFormula = cell.formula.replaceAll(findText, replaceText);
              cell.formula = newFormula;
              try {
                cell.value = evaluateFormula(newFormula, state.cells);
              } catch (error) {
                cell.value = '#ERROR!';
              }
              changesMade = true;
            }
          });
        });
        
        // If no changes were made, remove the history entry
        if (!changesMade) {
          undoStack.pop();
          set(state => {
            state.canUndo = undoStack.length > 0;
          });
        }
      }
    };
  })
);