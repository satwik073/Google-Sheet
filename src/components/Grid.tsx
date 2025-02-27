import React, { useState, useRef, useCallback } from 'react';
import { Cell } from './Cell';

const COLUMNS = 26; // A to Z
const ROWS = 100;
const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_CELL_HEIGHT = 24;

export const Grid: React.FC = () => {
  const getColumnLabel = (index: number) => String.fromCharCode(65 + index);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // State to track column widths and row heights
  const [columnWidths, setColumnWidths] = useState<number[]>(Array(COLUMNS).fill(DEFAULT_CELL_WIDTH));
  const [rowHeights, setRowHeights] = useState<number[]>(Array(ROWS).fill(DEFAULT_CELL_HEIGHT));
  
  // Refs to track resize operation
  const resizingRef = useRef<{
    type: 'column' | 'row';
    index: number;
    startPos: number;
    startSize: number;
  } | null>(null);

  // Start resize operation
  const startResize = useCallback((type: 'column' | 'row', index: number, startPos: number, startSize: number) => {
    resizingRef.current = { type, index, startPos, startSize };
  }, []);

  // Handler for column resize
  const handleColumnResizeStart = useCallback((e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    startResize('column', colIndex, e.clientX, columnWidths[colIndex]);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizingRef.current && resizingRef.current.type === 'column') {
        const diff = moveEvent.clientX - resizingRef.current.startPos;
        const newWidth = Math.max(50, resizingRef.current.startSize + diff);
        
        setColumnWidths(prev => {
          const newWidths = [...prev];
          newWidths[resizingRef.current!.index] = newWidth;
          return newWidths;
        });
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
    startResize('row', rowIndex, e.clientY, rowHeights[rowIndex]);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizingRef.current && resizingRef.current.type === 'row') {
        const diff = moveEvent.clientY - resizingRef.current.startPos;
        const newHeight = Math.max(20, resizingRef.current.startSize + diff);
        
        setRowHeights(prev => {
          const newHeights = [...prev];
          newHeights[resizingRef.current!.index] = newHeight;
          return newHeights;
        });
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

  return (
    <div className="overflow-auto relative" ref={gridRef}>
      <div 
        className="grid" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: `auto ${columnWidths.map(width => `${width}px`).join(' ')}`,
          gridTemplateRows: `auto ${rowHeights.map(height => `${height}px`).join(' ')}`
        }}
      >
        {/* Header row */}
        <div className="bg-gray-100 border border-gray-300 p-1 text-center flex items-center justify-center"></div>
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <div 
            key={`header-${i}`} 
            className="bg-gray-100 border border-gray-300 p-1 text-center relative flex items-center justify-center"
          >
            {getColumnLabel(i)}
            <div 
              className="absolute right-0 top-0 h-full w-1 bg-gray-400 opacity-0 hover:opacity-100 cursor-col-resize"
              onMouseDown={(e) => handleColumnResizeStart(e, i)}
            ></div>
          </div>
        ))}

        {/* Grid cells */}
        {Array.from({ length: ROWS }).map((_, row) => (
          <React.Fragment key={`row-${row}`}>
            <div className="bg-gray-100 border border-gray-300 p-1 text-center relative flex items-center justify-center">
              {row + 1}
              <div 
                className="absolute bottom-0 left-0 w-full h-1 bg-gray-400 opacity-0 hover:opacity-100 cursor-row-resize"
                onMouseDown={(e) => handleRowResizeStart(e, row)}
              ></div>
            </div>
            {Array.from({ length: COLUMNS }).map((_, col) => (
              <Cell
                key={`${getColumnLabel(col)}${row + 1}`}
                id={`${getColumnLabel(col)}${row + 1}`}
                row={row}
                col={col}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};