import { evaluate } from 'mathjs';
import { CellData } from '../types/sheet';

export function evaluateFormula(formula: string, cells: { [key: string]: CellData }): string {
  if (!formula.startsWith('=')) {
    return formula;
  }

  try {
    const cleanFormula = formula.substring(1).trim();
    
    // Handle range-based functions
    if (cleanFormula.startsWith('SUM(')) {
      return calculateSum(cleanFormula, cells);
    } else if (cleanFormula.startsWith('AVERAGE(')) {
      return calculateAverage(cleanFormula, cells);
    } else if (cleanFormula.startsWith('MAX(')) {
      return calculateMax(cleanFormula, cells);
    } else if (cleanFormula.startsWith('MIN(')) {
      return calculateMin(cleanFormula, cells);
    } else if (cleanFormula.startsWith('COUNT(')) {
      return calculateCount(cleanFormula, cells);
    } else if (cleanFormula.startsWith('CONCATENATE(')) {
      return calculateConcatenate(cleanFormula, cells);
    } else if (cleanFormula.startsWith('IF(')) {
      return calculateIf(cleanFormula, cells);
    } 
    // Text formatting functions
    else if (cleanFormula.startsWith('UPPER(')) {
      return formatUpper(cleanFormula, cells);
    } else if (cleanFormula.startsWith('LOWER(')) {
      return formatLower(cleanFormula, cells);
    } else if (cleanFormula.startsWith('TRIM(')) {
      return formatTrim(cleanFormula, cells);
    } else if (cleanFormula.startsWith('PROPER(')) {
      return formatProper(cleanFormula, cells);
    } else if (cleanFormula.startsWith('LEN(')) {
      return calculateLen(cleanFormula, cells);
    }
    
    // For general expressions, replace cell references with their values
    const expression = cleanFormula.replace(/([A-Z]+[0-9]+)/g, (match) => {
      const cellValue = cells[match]?.value || '0';
      // If it's not a number, wrap in quotes
      return isNaN(Number(cellValue)) ? `"${cellValue}"` : cellValue;
    });
    
    return evaluate(expression).toString();
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
}

// Get cell reference from a formula like UPPER(A1)
function getCellRefFromFormula(formula: string): string | null {
  const match = formula.match(/\(([A-Z]+[0-9]+)\)/);
  return match ? match[1] : null;
}

// Get value from a cell reference or literal in a formula
function getValueFromParam(param: string, cells: { [key: string]: CellData }): string {
  param = param.trim();
  
  // Check if it's a cell reference like A1
  if (param.match(/^[A-Z]+[0-9]+$/)) {
    return cells[param]?.value || '';
  } 
  // Check if it's a string literal like "text"
  else if (param.startsWith('"') && param.endsWith('"')) {
    return param.substring(1, param.length - 1);
  } 
  // Otherwise, return as is
  else {
    return param;
  }
}

// Format functions
function formatUpper(formula: string, cells: { [key: string]: CellData }): string {
  const cellRef = getCellRefFromFormula(formula);
  if (!cellRef) return '#ERROR!';
  
  const value = cells[cellRef]?.value || '';
  return value.toUpperCase();
}

function formatLower(formula: string, cells: { [key: string]: CellData }): string {
  const cellRef = getCellRefFromFormula(formula);
  if (!cellRef) return '#ERROR!';
  
  const value = cells[cellRef]?.value || '';
  return value.toLowerCase();
}

function formatTrim(formula: string, cells: { [key: string]: CellData }): string {
  const cellRef = getCellRefFromFormula(formula);
  if (!cellRef) return '#ERROR!';
  
  const value = cells[cellRef]?.value || '';
  return value.trim();
}

function formatProper(formula: string, cells: { [key: string]: CellData }): string {
  const cellRef = getCellRefFromFormula(formula);
  if (!cellRef) return '#ERROR!';
  
  const value = cells[cellRef]?.value || '';
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function calculateLen(formula: string, cells: { [key: string]: CellData }): string {
  const cellRef = getCellRefFromFormula(formula);
  if (!cellRef) return '#ERROR!';
  
  const value = cells[cellRef]?.value || '';
  return value.length.toString();
}

function extractRange(expression: string): string[] {
  // Parse the range expression like SUM(A1:B3)
  const rangeMatch = expression.match(/\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)/);
  if (!rangeMatch) return [];
  
  const start = rangeMatch[1];
  const end = rangeMatch[2];
  
  // Extract column letters and row numbers
  const startCol = start.match(/[A-Z]+/)?.[0] || '';
  const startRow = parseInt(start.match(/\d+/)?.[0] || '0');
  const endCol = end.match(/[A-Z]+/)?.[0] || '';
  const endRow = parseInt(end.match(/\d+/)?.[0] || '0');
  
  // Convert column letters to ASCII codes for easier iteration
  const startColCode = startCol.charCodeAt(0);
  const endColCode = endCol.charCodeAt(0);
  
  const cells: string[] = [];
  
  // Iterate through the range
  for (let colCode = startColCode; colCode <= endColCode; colCode++) {
    const col = String.fromCharCode(colCode);
    for (let row = startRow; row <= endRow; row++) {
      cells.push(`${col}${row}`);
    }
  }
  
  return cells;
}

function calculateSum(expression: string, cells: { [key: string]: CellData }): string {
  const range = extractRange(expression);
  if (range.length === 0) return '#ERROR!';
  
  const sum = range.reduce((acc, cellId) => {
    const value = Number(cells[cellId]?.value || 0);
    return acc + (isNaN(value) ? 0 : value);
  }, 0);
  
  return sum.toString();
}

function calculateAverage(expression: string, cells: { [key: string]: CellData }): string {
  const range = extractRange(expression);
  if (range.length === 0) return '#ERROR!';
  
  const values = range
    .map((cellId) => Number(cells[cellId]?.value || 0))
    .filter((value) => !isNaN(value));
  
  if (values.length === 0) return '0';
  const average = values.reduce((acc, val) => acc + val, 0) / values.length;
  return average.toFixed(2);
}

function calculateMax(expression: string, cells: { [key: string]: CellData }): string {
  const range = extractRange(expression);
  if (range.length === 0) return '#ERROR!';
  
  const values = range
    .map((cellId) => Number(cells[cellId]?.value || 0))
    .filter((value) => !isNaN(value));
  
  if (values.length === 0) return '0';
  return Math.max(...values).toString();
}

function calculateMin(expression: string, cells: { [key: string]: CellData }): string {
  const range = extractRange(expression);
  if (range.length === 0) return '#ERROR!';
  
  const values = range
    .map((cellId) => Number(cells[cellId]?.value || 0))
    .filter((value) => !isNaN(value));
  
  if (values.length === 0) return '0';
  return Math.min(...values).toString();
}

function calculateCount(expression: string, cells: { [key: string]: CellData }): string {
  const range = extractRange(expression);
  if (range.length === 0) return '#ERROR!';
  
  const count = range.filter((cellId) => {
    const value = cells[cellId]?.value;
    return value !== undefined && value !== null && value !== '' && !isNaN(Number(value));
  }).length;
  
  return count.toString();
}

function calculateConcatenate(expression: string, cells: { [key: string]: CellData }): string {
  // Extract cell references from CONCATENATE(A1,B1,C1)
  const matches = expression.match(/CONCATENATE\((.*)\)/);
  if (!matches) return '#ERROR!';
  
  const parts = matches[1].split(',');
  let result = '';
  
  for (const part of parts) {
    result += getValueFromParam(part, cells);
  }
  
  return result;
}

function calculateIf(expression: string, cells: { [key: string]: CellData }): string {
  try {
    // Extract parts from IF(condition, trueValue, falseValue)
    const ifMatch = expression.match(/IF\((.*),(.*),(.*)\)/);
    if (!ifMatch) return '#ERROR!';
    
    const condition = ifMatch[1].trim();
    const trueValue = ifMatch[2].trim();
    const falseValue = ifMatch[3].trim();
    
    // Replace cell references in the condition
    const parsedCondition = condition.replace(/([A-Z]+[0-9]+)/g, (match) => {
      const cellValue = cells[match]?.value || '0';
      return isNaN(Number(cellValue)) ? `"${cellValue}"` : cellValue;
    });
    
    // Evaluate the condition
    const result = evaluate(parsedCondition);
    
    if (result) {
      return getValueFromParam(trueValue, cells);
    } else {
      return getValueFromParam(falseValue, cells);
    }
  } catch (error) {
    return '#ERROR!';
  }
}

// Enhanced data quality functions (utility version)
export function applyDataQualityFunction(func: string, value: string): string {
  const functionName = func.toUpperCase();
  
  switch (functionName) {
    case 'TRIM':
      return value.trim();
    case 'UPPER':
      return value.toUpperCase();
    case 'LOWER':
      return value.toLowerCase();
    case 'PROPER':
      // Capitalize first letter of each word
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    case 'LEN':
      return value.length.toString();
    case 'REPLACE_SPACES':
      return value.replace(/\s+/g, '_');
    case 'CURRENCY_USD':
      return isNaN(Number(value)) ? '#ERROR!' : `$${parseFloat(value).toFixed(2)}`;
    case 'PERCENTAGE':
      return isNaN(Number(value)) ? '#ERROR!' : `${(parseFloat(value) * 100).toFixed(1)}%`;
    default:
      return value;
  }
}

// Add helper functions for date handling
export function formatDate(dateString: string, format: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '#INVALID_DATE!';
    }
    
    switch (format.toUpperCase()) {
      case 'SHORT':
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      case 'LONG':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'ISO':
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString();
    }
  } catch (error) {
    return '#ERROR!';
  }
}