import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SheetState, CellData, CellStyle } from '../types/sheet';
import { evaluateFormula } from '../utils/formulas';

const DEFAULT_CELL_STYLE: CellStyle = {
  bold: false,
  italic: false,
  underline: false, // Default as false
  strikethrough: false, // Default as false
  fontSize: 14,
  color: '#000000',
  backgroundColor: '#ffffff',
  textAlign: 'left',
  fontFamily: 'Arial, sans-serif',
};


const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;

export interface SheetStore extends SheetState {
  setCellValue: (cellId: string, value: string) => void;
  setCellFormula: (cellId: string, formula: string) => void;
  setCellStyle: (cellId: string, style: Partial<CellStyle>) => void;
  setSelectedCell: (cellId: string | null) => void;
  setSelectedRange: (range: string[] | null) => void;
  setColumnWidth: (colId: string, width: number) => void;
  setRowHeight: (rowId: string, height: number) => void;
  
  // Add new operations
  addRow: (afterRowIndex: number) => void;
  addColumn: (afterColIndex: number) => void;
  deleteRow: (rowIndex: number) => void;
  deleteColumn: (colIndex: number) => void;
  
  undoAction: () => void;
  redoAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  findAndReplace: (findText: string, replaceText: string) => void;
  
  // Add references to total row/column counts
  totalRows: number;
  totalColumns: number;
  setTotalRows: (count: number) => void;
  setTotalColumns: (count: number) => void;
}

// Create a history stack implementation outside the store
type HistoryState = {
  cells: Record<string, CellData>;
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  totalRows: number;
  totalColumns: number;
};

// Helper function to get column letter from index
const getColumnLabel = (index: number): string => String.fromCharCode(65 + index);

// Helper function to parse cell ID into row and column indices
const parseCellId = (cellId: string): { colIndex: number, rowIndex: number } => {
  const colLetter = cellId.match(/[A-Z]+/)?.[0] || 'A';
  const rowNumber = parseInt(cellId.match(/\d+/)?.[0] || '1', 10);
  
  const colIndex = colLetter.charCodeAt(0) - 65; // A = 0, B = 1, etc.
  const rowIndex = rowNumber - 1; // 1-based to 0-based
  
  return { colIndex, rowIndex };
};

// Helper function to create cell ID from row and column indices
const createCellId = (colIndex: number, rowIndex: number): string => {
  return `${getColumnLabel(colIndex)}${rowIndex + 1}`;
};

export const useSheetStore = create<SheetStore>()(
  immer((set, get) => {
    // Initialize history stacks
    const undoStack: HistoryState[] = [];
    const redoStack: HistoryState[] = [];
    
    // Helper to save current state to history
    const saveToHistory = () => {
      const { cells, columnWidths, rowHeights, totalRows, totalColumns } = get();
      undoStack.push({
        cells: JSON.parse(JSON.stringify(cells)),
        columnWidths: JSON.parse(JSON.stringify(columnWidths)),
        rowHeights: JSON.parse(JSON.stringify(rowHeights)),
        totalRows,
        totalColumns
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
      totalRows: 100, // Default number of rows
      totalColumns: 26, // Default number of columns (A-Z)

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
      
      setTotalRows: (count) => 
        set(state => {
          state.totalRows = count;
        }),
        
      setTotalColumns: (count) => 
        set(state => {
          state.totalColumns = count;
        }),
      
      // Add a new row after the specified row index
      addRow: (afterRowIndex) => {
        saveToHistory();
        
        set(state => {
          // Increment total row count
          state.totalRows += 1;
          
          // Shift existing cells down
          const newCells: Record<string, CellData> = {};
          
          // Copy existing cells with adjustments
          Object.entries(state.cells).forEach(([cellId, cellData]) => {
            const { colIndex, rowIndex } = parseCellId(cellId);
            
            if (rowIndex > afterRowIndex) {
              // This cell needs to be moved down
              const newRowIndex = rowIndex + 1;
              const newCellId = createCellId(colIndex, newRowIndex);
              newCells[newCellId] = cellData;
            } else {
              // This cell stays in place
              newCells[cellId] = cellData;
            }
          });
          
          state.cells = newCells;
          
          // Shift row heights
          const newRowHeights: Record<string, number> = {};
          Object.entries(state.rowHeights).forEach(([rowId, height]) => {
            const rowIndex = parseInt(rowId, 10) - 1;
            if (rowIndex > afterRowIndex) {
              newRowHeights[`${rowIndex + 2}`] = height;
            } else {
              newRowHeights[rowId] = height;
            }
          });
          
          // Set the new row's height to default
          newRowHeights[`${afterRowIndex + 2}`] = DEFAULT_ROW_HEIGHT;
          
          state.rowHeights = newRowHeights;
        });
      },
      
      // Add a new column after the specified column index
      addColumn: (afterColIndex) => {
        saveToHistory();
        
        set(state => {
          // Increment total column count
          state.totalColumns += 1;
          
          // Shift existing cells right
          const newCells: Record<string, CellData> = {};
          
          // Copy existing cells with adjustments
          Object.entries(state.cells).forEach(([cellId, cellData]) => {
            const { colIndex, rowIndex } = parseCellId(cellId);
            
            if (colIndex > afterColIndex) {
              // This cell needs to be moved right
              const newColIndex = colIndex + 1;
              const newCellId = createCellId(newColIndex, rowIndex);
              newCells[newCellId] = cellData;
            } else {
              // This cell stays in place
              newCells[cellId] = cellData;
            }
          });
          
          state.cells = newCells;
          
          // Shift column widths
          const newColumnWidths: Record<string, number> = {};
          Object.entries(state.columnWidths).forEach(([colId, width]) => {
            const colIndex = colId.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (colIndex > afterColIndex) {
              const newColId = String.fromCharCode(colIndex + 1 + 65);
              newColumnWidths[newColId] = width;
            } else {
              newColumnWidths[colId] = width;
            }
          });
          
          // Set the new column's width to default
          const newColId = String.fromCharCode(afterColIndex + 1 + 65);
          newColumnWidths[newColId] = DEFAULT_COLUMN_WIDTH;
          
          state.columnWidths = newColumnWidths;
        });
      },
      
      // Delete the row at the specified index
      deleteRow: (rowIndex) => {
        saveToHistory();
        
        set(state => {
          if (state.totalRows <= 1) {
            // Prevent deleting the last row
            return;
          }
          
          // Decrement total row count
          state.totalRows -= 1;
          
          // Shift existing cells up
          const newCells: Record<string, CellData> = {};
          
          // Copy existing cells with adjustments, skipping the deleted row
          Object.entries(state.cells).forEach(([cellId, cellData]) => {
            const parsedCell = parseCellId(cellId);
            
            if (parsedCell.rowIndex === rowIndex) {
              // Skip this cell (it's being deleted)
              return;
            } else if (parsedCell.rowIndex > rowIndex) {
              // This cell needs to be moved up
              const newRowIndex = parsedCell.rowIndex - 1;
              const newCellId = createCellId(parsedCell.colIndex, newRowIndex);
              newCells[newCellId] = cellData;
            } else {
              // This cell stays in place
              newCells[cellId] = cellData;
            }
          });
          
          state.cells = newCells;
          
          // Shift row heights
          const newRowHeights: Record<string, number> = {};
          Object.entries(state.rowHeights).forEach(([rowId, height]) => {
            const rowNum = parseInt(rowId, 10);
            if (rowNum === rowIndex + 1) {
              // Skip this row height (it's being deleted)
              return;
            } else if (rowNum > rowIndex + 1) {
              newRowHeights[`${rowNum - 1}`] = height;
            } else {
              newRowHeights[rowId] = height;
            }
          });
          
          state.rowHeights = newRowHeights;
        });
      },
      
      // Delete the column at the specified index
      deleteColumn: (colIndex) => {
        saveToHistory();
        
        set(state => {
          if (state.totalColumns <= 1) {
            // Prevent deleting the last column
            return;
          }
          
          // Decrement total column count
          state.totalColumns -= 1;
          
          // Shift existing cells left
          const newCells: Record<string, CellData> = {};
          
          // Copy existing cells with adjustments, skipping the deleted column
          Object.entries(state.cells).forEach(([cellId, cellData]) => {
            const parsedCell = parseCellId(cellId);
            
            if (parsedCell.colIndex === colIndex) {
              // Skip this cell (it's being deleted)
              return;
            } else if (parsedCell.colIndex > colIndex) {
              // This cell needs to be moved left
              const newColIndex = parsedCell.colIndex - 1;
              const newCellId = createCellId(newColIndex, parsedCell.rowIndex);
              newCells[newCellId] = cellData;
            } else {
              // This cell stays in place
              newCells[cellId] = cellData;
            }
          });
          
          state.cells = newCells;
          
          // Shift column widths
          const newColumnWidths: Record<string, number> = {};
          Object.entries(state.columnWidths).forEach(([colId, width]) => {
            const colChar = colId.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (colChar === colIndex) {
              // Skip this column width (it's being deleted)
              return;
            } else if (colChar > colIndex) {
              const newColId = String.fromCharCode(colChar - 1 + 65);
              newColumnWidths[newColId] = width;
            } else {
              newColumnWidths[colId] = width;
            }
          });
          
          state.columnWidths = newColumnWidths;
        });
      },

      undoAction: () => {
        if (undoStack.length === 0) return;

        // Save current state to redo stack
        const currentState = get();
        redoStack.push({
          cells: JSON.parse(JSON.stringify(currentState.cells)),
          columnWidths: JSON.parse(JSON.stringify(currentState.columnWidths)),
          rowHeights: JSON.parse(JSON.stringify(currentState.rowHeights)),
          totalRows: currentState.totalRows,
          totalColumns: currentState.totalColumns
        });

        // Get the previous state from undo stack
        const previousState = undoStack.pop()!;

        // Apply the previous state
        set(state => {
          state.cells = previousState.cells;
          state.columnWidths = previousState.columnWidths;
          state.rowHeights = previousState.rowHeights;
          state.totalRows = previousState.totalRows;
          state.totalColumns = previousState.totalColumns;
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
          rowHeights: JSON.parse(JSON.stringify(currentState.rowHeights)),
          totalRows: currentState.totalRows,
          totalColumns: currentState.totalColumns
        });

        // Get the next state from redo stack
        const nextState = redoStack.pop()!;

        // Apply the next state
        set(state => {
          state.cells = nextState.cells;
          state.columnWidths = nextState.columnWidths;
          state.rowHeights = nextState.rowHeights;
          state.totalRows = nextState.totalRows;
          state.totalColumns = nextState.totalColumns;
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