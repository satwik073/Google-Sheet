//@ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useSheetStore } from '../store/useSheetStore';

interface CellProps {
  id: string;
  row: number;
  col: number;
  style?: React.CSSProperties;
}

export const Cell: React.FC<CellProps> = ({ id, row, col, style = {} }) => {
  const { cells, selectedCell, setSelectedCell, setCellValue } = useSheetStore();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellData = cells[id] || { value: '', formula: '', style: {} };
  const isSelected = selectedCell === id;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle double-click to edit
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Handle cell selection
  const handleClick = () => {
    setSelectedCell(id);
    setIsEditing(true);
  };

  // Handle value change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update when editing
    if (isEditing) {
      setCellValue(id, e.target.value);
    }
  };

  // Handle finishing edit
  const handleBlur = () => {
    setIsEditing(false);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setIsEditing(false);
      
      // Move to next cell
      if (e.key === 'Tab') {
        const nextColIndex = e.shiftKey ? col - 1 : col + 1;
        if (nextColIndex >= 0 && nextColIndex < 26) {
          const nextColLetter = String.fromCharCode(65 + nextColIndex);
          setSelectedCell(`${nextColLetter}${row + 1}`);
        }
      } else if (e.key === 'Enter') {
        const nextRowIndex = e.shiftKey ? row - 1 : row + 1;
        if (nextRowIndex >= 0 && nextRowIndex < 100) {
          const colLetter = String.fromCharCode(65 + col);
          setSelectedCell(`${colLetter}${nextRowIndex + 1}`);
        }
      }
    }
  };

  const cellStyle = {
    ...style,
    fontWeight: cellData.style.bold ? 'bold' : 'normal',
    fontStyle: cellData.style.italic ? 'italic' : 'normal',
    fontSize: `${cellData.style.fontSize || 14}px`,
    color: cellData.style.color || '#000000',
    textDecoration: `${cellData?.style?.underline ? 'underline' : ''} ${cellData?.style.strikethrough ? 'line-through' : ''}`.trim(),
    backgroundColor: cellData.style.backgroundColor || '#ffffff',
    textAlign: cellData.style.textAlign || 'left',
    fontFamily: cellData.style.fontFamily || 'Arial, sans-serif',
    padding: '4px',
    height: '100%',
    width: '100%',
    border: isSelected ? '2px solid #1a73e8' : '1px solid #e2e2e2',
    outline: 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      className="cell-container"
      onClick={handleClick}
     
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={cellData.formula || cellData.value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...cellStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        />
      ) : (
        <div style={cellStyle}>
          {cellData.value}
        </div>
      )}
    </div>
  );
};