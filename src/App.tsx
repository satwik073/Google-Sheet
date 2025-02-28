//@ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { FormulaBar } from './components/FormulaBar';
import { Grid } from './components/Grid';
import { useSheetStore } from './store/useSheetStore';
import ChartComponent from './components/ChartComponent'; // Import the ChartComponent
import StaticToolbar from './Global/StaticToolbar';
import ImageLinks from './Assets';
import { GOOGLE_SHEETS_CONSTANT } from './Constants/constants';
import { Edit2Icon, Plus, Trash, Trash2, Trash2Icon, TrashIcon } from 'lucide-react';

// Default values
const DEFAULT_CELL_WIDTH = 100;

function App() {
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(null);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  const [showChart, setShowChart] = useState(false); // State to toggle chart view

  // Helper function to generate column labels (A, B, C, ...)
  const getColumnLabel = (index) => String.fromCharCode(65 + index);

  // Load all spreadsheets from localStorage on initial page load
  useEffect(() => {
    const savedSpreadsheets = JSON.parse(localStorage.getItem('spreadsheets')) || [];
    setSpreadsheets(savedSpreadsheets);
    if (savedSpreadsheets.length > 0) {
      setCurrentSpreadsheetId(savedSpreadsheets[0].id);
      loadSpreadsheet(savedSpreadsheets[0].id);
    }else {
      // Set a default spreadsheet when none exist
      const defaultSpreadsheet = {
        id: 'Sheet1',
        name: 'Sheet 1',
        data: JSON.stringify({
          cells: {},
          columnWidths: initializeColumnWidths(10),
          rowHeights: {},
          totalRows: 100,
          totalColumns: 100,
        }),
      };
      setCurrentSpreadsheetId(defaultSpreadsheet.id);
      setSpreadsheets([defaultSpreadsheet]);
      useSheetStore.setState({
        cells: {},
        columnWidths: initializeColumnWidths(10),
        rowHeights: {},
        totalRows: 100,
        totalColumns: 100,
      });
      setLastSavedState(defaultSpreadsheet.data);
    }
  }, []);

  // Save the current spreadsheet to localStorage
  const saveSpreadsheet = useCallback(() => {
    const state = useSheetStore.getState();
    const serializedState = JSON.stringify({
      cells: state.cells,
      columnWidths: state.columnWidths,
      rowHeights: state.rowHeights,
      totalRows: state.totalRows,
      totalColumns: state.totalColumns,
    });

    const updatedSpreadsheets = spreadsheets.map(spreadsheet =>
      spreadsheet.id === currentSpreadsheetId ? { ...spreadsheet, data: serializedState } : spreadsheet
    );

    localStorage.setItem('spreadsheets', JSON.stringify(updatedSpreadsheets));
    setSpreadsheets(updatedSpreadsheets);
    setLastSavedState(serializedState);
    setIsDirty(false);
  }, [currentSpreadsheetId, spreadsheets]);

  // Initialize default column widths for a given totalColumns
  const initializeColumnWidths = (totalColumns, existingWidths = {}) => {
    const columnWidths = { ...existingWidths };

    // Ensure each column has a width
    for (let i = 0; i < totalColumns; i++) {
      const colId = getColumnLabel(i);
      if (columnWidths[colId] === undefined) {
        columnWidths[colId] = DEFAULT_CELL_WIDTH;
      }
    }

    return columnWidths;
  };

  // Load a specific spreadsheet from localStorage
  const loadSpreadsheet = useCallback((id) => {
    const spreadsheet = spreadsheets.find(sp => sp.id === id);
    if (spreadsheet) {
      try {
        const state = JSON.parse(spreadsheet.data || '{}');

        // Ensure we have valid data and column widths before setting state
        const totalColumns = Math.max(1, state.totalColumns || 10);
        const columnWidths = initializeColumnWidths(totalColumns, state.columnWidths || {});

        const validatedState = {
          cells: state.cells || {},
          columnWidths: columnWidths,
          rowHeights: state.rowHeights || {},
          totalRows: Math.max(1, state.totalRows || 10),
          totalColumns: totalColumns,
        };

        // Reset the store with the loaded state
        useSheetStore.setState(validatedState);

        setLastSavedState(spreadsheet.data);
        setCurrentSpreadsheetId(id);
        setIsDirty(false);
      } catch (error) {
        console.error("Error loading spreadsheet:", error);
        // Handle corrupted data by setting defaults
        const defaultColumnWidths = initializeColumnWidths(10);

        useSheetStore.setState({
          cells: {},
          columnWidths: defaultColumnWidths,
          rowHeights: {},
          totalRows: 10,
          totalColumns: 10,
        });
      }
    }
  }, [spreadsheets]);

  // Create a new spreadsheet
  const createNewSpreadsheet = useCallback(() => {
    if (isDirty) {
      // Optionally prompt user to save changes
      const confirmCreate = window.confirm("You have unsaved changes. Create new spreadsheet anyway?");
      if (!confirmCreate) return;
    }

    // Initialize column widths for the new spreadsheet
    const defaultColumnWidths = initializeColumnWidths(100);

    const newSpreadsheetState = {
      cells: {},
      columnWidths: defaultColumnWidths,
      rowHeights: {},
      totalRows: 100,
      totalColumns: 100,
    };

    const newSpreadsheet = {
      id: Date.now().toString(),
      name: `Sheet ${spreadsheets.length + 1}`,
      data: JSON.stringify(newSpreadsheetState),
    };

    const updatedSpreadsheets = [...spreadsheets, newSpreadsheet];
    localStorage.setItem('spreadsheets', JSON.stringify(updatedSpreadsheets));
    setSpreadsheets(updatedSpreadsheets);
    setCurrentSpreadsheetId(newSpreadsheet.id);

    // Set the state directly to ensure immediate update
    useSheetStore.setState(newSpreadsheetState);

    setLastSavedState(newSpreadsheet.data);
    setIsDirty(false);
  }, [isDirty, spreadsheets]);

  // Delete a spreadsheet
  const deleteSpreadsheet = useCallback((id) => {
    const updatedSpreadsheets = spreadsheets.filter(sp => sp.id !== id);
    localStorage.setItem('spreadsheets', JSON.stringify(updatedSpreadsheets));
    setSpreadsheets(updatedSpreadsheets);

    if (currentSpreadsheetId === id && updatedSpreadsheets.length > 0) {
      setCurrentSpreadsheetId(updatedSpreadsheets[0].id);
      loadSpreadsheet(updatedSpreadsheets[0].id);
    } else if (updatedSpreadsheets.length === 0) {
      setCurrentSpreadsheetId(null);

      // Initialize default column widths
      const defaultColumnWidths = initializeColumnWidths(10);

      useSheetStore.setState({
        cells: {},
        columnWidths: defaultColumnWidths,
        rowHeights: {},
        totalRows: 10,
        totalColumns: 10,
      });
      setLastSavedState(null);
      setIsDirty(false);
    }
  }, [currentSpreadsheetId, loadSpreadsheet, spreadsheets]);

  // Rename a spreadsheet
  const renameSpreadsheet = useCallback((id, newName) => {
    const updatedSpreadsheets = spreadsheets.map(spreadsheet =>
      spreadsheet.id === id ? { ...spreadsheet, name: newName } : spreadsheet
    );

    localStorage.setItem('spreadsheets', JSON.stringify(updatedSpreadsheets));
    setSpreadsheets(updatedSpreadsheets);
  }, [spreadsheets]);

  // Extract data for the chart
  const getChartData = () => {
    const state = useSheetStore.getState();
    const labels = [];
    const values = [];

    // Example: Use the first row as labels and the second row as values
    for (let i = 0; i < state.totalColumns; i++) {
      const colId = getColumnLabel(i);
      const cellKey1 = `0-${colId}`; // First row
      const cellKey2 = `1-${colId}`; // Second row

      labels.push(state.cells[cellKey1]?.value || `Column ${colId}`);
      values.push(parseFloat(state.cells[cellKey2]?.value) || 0);
    }

    return { labels, values };
  };

  // Detect unsaved changes in the store
  useEffect(() => {
    const unsubscribe = useSheetStore.subscribe(
      (state) => {
        const serializedState = JSON.stringify({
          cells: state.cells,
          columnWidths: state.columnWidths,
          rowHeights: state.rowHeights,
          totalRows: state.totalRows,
          totalColumns: state.totalColumns,
        });

        if (lastSavedState !== null && serializedState !== lastSavedState) {
          setIsDirty(true);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [lastSavedState]);

  return (
    <div className="h-screen flex flex-col bg-gray">
      <StaticToolbar imageLink={ImageLinks?._GoogleSheetLogo}
        titleContent='Untitled spreadsheet'
        content={GOOGLE_SHEETS_CONSTANT?.static_toolbar_config}
        isIconDisplay = {false}
      />
      <Toolbar/>
      <FormulaBar />
      <div className="flex-1 p-0 overflow-hidden">
        {showChart ? (
          <ChartComponent data={getChartData()} />
        ) : (
          <Grid />
        )}
      </div>
      <div className=" p-1 border-t  flex justify-between">
        
        <div className="flex items-center">
        <button
            onClick={createNewSpreadsheet}
            className="ml-2 p-2  rounded"
          >
            <Plus size={16}/>
          </button>
          <select
            value={currentSpreadsheetId || 'Sheet 1'}
            onChange={(e) => loadSpreadsheet(e.target.value)}
            className="rounded text-sm  px-3 border-r"

          >
            {spreadsheets.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
     
          {currentSpreadsheetId && (
            <>
              <button
                onClick={() => deleteSpreadsheet(currentSpreadsheetId)}
                className="ml-2 "
              >
                <Trash2Icon size={18}/>
              </button>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="Rename spreadsheet"
                className="ml-2 px-3 border rounded"
              />
              <button
                onClick={() => {
                  renameSpreadsheet(currentSpreadsheetId, renameInput);
                  setRenameInput('');
                }}
                className="ml-2 "
              >
                <Edit2Icon  size={18}/>
              </button>
              {/* <button
                onClick={() => setShowChart(!showChart)}
                className="ml-2 p-2 bg-purple-500 text-white rounded"
              >
                {showChart ? 'Hide Chart' : 'Show Chart'}
              </button> */}
            </>
          )}
        </div>
        <button
          onClick={saveSpreadsheet}
          disabled={!isDirty}
          className="p-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          Save
        </button>
      </div>

    </div>
  );
}

export default App;
