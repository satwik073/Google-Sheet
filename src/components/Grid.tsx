//@ts-nocheck
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Cell } from './Cell';
import { useSheetStore } from '../store/useSheetStore';
import { PlusIcon, MinusIcon, MoreHorizontalIcon } from 'lucide-react';

const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_CELL_HEIGHT = 24;
const DEFAULT_HEADER_WIDTH = 30; // Width for row headers (1, 2, 3...)

export const Grid: React.FC = () => {
  // Get store state and actions
  const {
    totalRows,
    totalColumns,
    columnWidths,
    rowHeights,
    addRow,
    addColumn,
    deleteRow,
    deleteColumn,
    setColumnWidth
  } = useSheetStore();
  
  const getColumnLabel = (index: number) => String.fromCharCode(65 + index);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // State for context menus
  const [showColMenu, setShowColMenu] = useState<{ index: number, x: number, y: number } | null>(null);
  const [showRowMenu, setShowRowMenu] = useState<{ index: number, x: number, y: number } | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  // State to trigger re-renders when spreadsheet changes
  const [gridKey, setGridKey] = useState(Date.now());
  
  // Refs to track resize operation
  const resizingRef = useRef<{
    type: 'column' | 'row';
    index: number;
    startPos: number;
    startSize: number;
  } | null>(null);

  // Ensure column widths are initialized properly
  useEffect(() => {
    // Check if we need to initialize any default column widths
    let needsUpdate = false;
    const colWidthUpdates = {};
    
    for (let i = 0; i < totalColumns; i++) {
      const colId = getColumnLabel(i);
      if (columnWidths[colId] === undefined) {
        colWidthUpdates[colId] = DEFAULT_CELL_WIDTH;
        needsUpdate = true;
      }
    }
    
    // Apply column width updates if needed
    if (needsUpdate) {
      const state = useSheetStore.getState();
      useSheetStore.setState({
        ...state,
        columnWidths: { ...state.columnWidths, ...colWidthUpdates }
      });
    }
  }, [totalColumns, columnWidths]);

  // Force re-render when store changes, but maintain column widths
  useEffect(() => {
    const unsubscribe = useSheetStore.subscribe(
      (state) => {
        setGridKey(Date.now());
      },
      (state) => [state.totalRows, state.totalColumns]
    );
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Start resize operation
  const startResize = useCallback((type: 'column' | 'row', index: number, startPos: number, startSize: number) => {
    resizingRef.current = { type, index, startPos, startSize };
  }, []);

  // Handler for column resize
  const handleColumnResizeStart = useCallback((e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    startResize('column', colIndex, e.clientX, columnWidths[getColumnLabel(colIndex)] || DEFAULT_CELL_WIDTH);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizingRef.current && resizingRef.current.type === 'column') {
        const diff = moveEvent.clientX - resizingRef.current.startPos;
        const newWidth = Math.max(50, resizingRef.current.startSize + diff);
        
        useSheetStore.getState().setColumnWidth(getColumnLabel(resizingRef.current.index), newWidth);
      }
    };
    
    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths, startResize]);

  // Handler for row resize
  const handleRowResizeStart = useCallback((e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    startResize('row', rowIndex, e.clientY, rowHeights[`${rowIndex + 1}`] || DEFAULT_CELL_HEIGHT);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizingRef.current && resizingRef.current.type === 'row') {
        const diff = moveEvent.clientY - resizingRef.current.startPos;
        const newHeight = Math.max(20, resizingRef.current.startSize + diff);
        
        useSheetStore.getState().setRowHeight(`${resizingRef.current.index + 1}`, newHeight);
      }
    };
    
    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [rowHeights, startResize]);

  // Column menu handlers
  const handleColumnOptions = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setShowColMenu({ 
      index: colIndex, 
      x: e.clientX, 
      y: e.clientY 
    });
    setShowRowMenu(null);
  };
  
  // Row menu handlers
  const handleRowOptions = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRowMenu({ 
      index: rowIndex, 
      x: e.clientX, 
      y: e.clientY 
    });
    setShowColMenu(null);
  };
  
  // Close menus when clicking outside
  const handleClickOutside = useCallback(() => {
    setShowColMenu(null);
    setShowRowMenu(null);
  }, []);
  
  // Add event listener to close menus
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Generate column width template with fixed header width
  const colWidthsTemplate = React.useMemo(() => {
    if (totalColumns <= 0) return `${DEFAULT_HEADER_WIDTH}px`;
    
    return `${DEFAULT_HEADER_WIDTH}px ${Array.from({ length: totalColumns })
      .map((_, i) => {
        const colId = getColumnLabel(i);
        return `${columnWidths[colId] || DEFAULT_CELL_WIDTH}px`;
      })
      .join(' ')}`;
  }, [columnWidths, totalColumns]);

  // Generate row height template
  const rowHeightsTemplate = React.useMemo(() => {
    if (totalRows <= 0) return "auto";
    
    return `auto ${Array.from({ length: totalRows })
      .map((_, i) => {
        const rowId = `${i + 1}`;
        return `${rowHeights[rowId] || DEFAULT_CELL_HEIGHT}px`;
      })
      .join(' ')}`;
  }, [rowHeights, totalRows]);

  // Make sure we have valid rows and columns
  const validRows = Math.max(0, totalRows);
  const validColumns = Math.max(0, totalColumns);

  return (
    <div className="overflow-auto relative" ref={gridRef}>
      <div 
        className="grid" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: colWidthsTemplate,
          gridTemplateRows: rowHeightsTemplate
        }}
      >
        {/* Header cell (top-left corner) */}
        <div 
          className=" border border-gray-400 p-1 text-center flex items-center justify-center sticky top-0 left-0 z-10"
          onClick={() => {
            setShowColMenu(null);
            setShowRowMenu(null);
          }}
          style={{ width: DEFAULT_HEADER_WIDTH }}
        >
          <PlusIcon 
            className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              addColumn(0);
              addRow(0);
            }}
          />
        </div>
        
        {/* Header row */}
        {Array.from({ length: validColumns }).map((_, i) => (
          <div 
            key={`header-${i}`} 
            className="border border-gray-400 text-[12px] text-center flex items-center justify-center sticky top-0 z-10"
            onClick={() => {
              setSelectedColumn(i);
              setShowColMenu(null);
              setShowRowMenu(null);
            }}
            style={{ width: columnWidths[getColumnLabel(i)] || DEFAULT_CELL_WIDTH }}
          >
            <div className="flex items-center space-x-1">
              <span>{getColumnLabel(i)}</span>
              {/* <MoreHorizontalIcon 
                className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" 
                onClick={(e) => handleColumnOptions(e, i)}
              /> */}
            </div>
            <div 
              className="absolute right-0 top-0 h-full w-1 bg-gray-400 opacity-0 hover:opacity-100 cursor-col-resize"
              onMouseDown={(e) => handleColumnResizeStart(e, i)}
            ></div>
          </div>
        ))}

        {/* Row headers and cells */}
        {Array.from({ length: validRows }).map((_, row) => (
          <React.Fragment key={`row-${row}`}>
            {/* Row header */}
            <div 
              className="border-b border-r border-gray-400 text-center text-[12px]  flex items-center justify-center sticky left-0 z-10"
              onClick={() => {
                setShowColMenu(null);
                setShowRowMenu(null);
              }}
              style={{ width: DEFAULT_HEADER_WIDTH, height: rowHeights[`${row + 1}`] || DEFAULT_CELL_HEIGHT }}
            >
              <div className="flex items-center space-x-1">
                <span>{row + 1}</span>
                {/* <MoreHorizontalIcon 
                  className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" 
                  onClick={(e) => handleRowOptions(e, row)}
                /> */}
              </div>
              <div 
                className="absolute bottom-0 left-0 w-full h-1 bg-gray-400 opacity-0 hover:opacity-100 cursor-row-resize"
                onMouseDown={(e) => handleRowResizeStart(e, row)}
              ></div>
            </div>
            
            {/* Grid cells */}
            {Array.from({ length: validColumns }).map((_, col) => (
              <Cell
                key={`${getColumnLabel(col)}${row + 1}`}
                id={`${getColumnLabel(col)}${row + 1}`}
                row={row}
                col={col}
                style={{
                  width: columnWidths[getColumnLabel(col)] || DEFAULT_CELL_WIDTH,
                  height: rowHeights[`${row + 1}`] || DEFAULT_CELL_HEIGHT,
                  backgroundColor: selectedColumn === col ? '#e0f7fa' : 'transparent',
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Column context menu */}
      {showColMenu && (
        <div 
          className="absolute bg-white shadow-lg border border-gray-200 rounded-md p-1 z-50"
          style={{ top: showColMenu.y, left: showColMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left rounded-md"
            onClick={() => {
              addColumn(showColMenu.index);
              setShowColMenu(null);
            }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Insert column after {getColumnLabel(showColMenu.index)}</span>
          </button>
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left rounded-md"
            onClick={() => {
              addColumn(showColMenu.index - 1);
              setShowColMenu(null);
            }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Insert column before {getColumnLabel(showColMenu.index)}</span>
          </button>
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left rounded-md text-red-500"
            onClick={() => {
              deleteColumn(showColMenu.index);
              setShowColMenu(null);
            }}
          >
            <MinusIcon className="w-4 h-4" />
            <span>Delete column {getColumnLabel(showColMenu.index)}</span>
          </button>
        </div>
      )}
      
      {/* Row context menu */}
      {showRowMenu && (
        <div 
          className="absolute bg-white shadow-lg border border-gray-200 rounded-md p-1 z-50"
          style={{ top: showRowMenu.y, left: showRowMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left rounded-md"
            onClick={() => {
              addRow(showRowMenu.index);
              setShowRowMenu(null);
            }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Insert row after {showRowMenu.index + 1}</span>
          </button>
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left rounded-md"
            onClick={() => {
              addRow(showRowMenu.index - 1);
              setShowRowMenu(null);
            }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Insert row before {showRowMenu.index + 1}</span>
          </button>
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left rounded-md text-red-500"
            onClick={() => {
              deleteRow(showRowMenu.index);
              setShowRowMenu(null);
            }}
          >
            <MinusIcon className="w-4 h-4" />
            <span>Delete row {showRowMenu.index + 1}</span>
          </button>
        </div>
      )}
    </div>
  );
};