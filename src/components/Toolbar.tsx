import React, { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { 
  Bold, 
  Italic, 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Search, 
  Undo, 
  Redo,
  Square, 
  X
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const { 
    selectedCell, 
    cells, 
    setCellStyle, 
    undoAction, 
    redoAction, 
    canUndo, 
    canRedo,
    findAndReplace 
  } = useSheetStore();
  
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleStyleChange = (styleUpdate: any) => {
    if (!selectedCell) return;
    setCellStyle(selectedCell, styleUpdate);
  };

  const handleFindReplace = () => {
    findAndReplace(findText, replaceText);
    setFindReplaceOpen(false);
  };

  const currentCell = selectedCell ? cells[selectedCell] : null;

  // Font families
  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' }
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b">
        {/* Undo/Redo Section */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            className={`p-1 hover:bg-gray-100 rounded ${!canUndo ? 'opacity-50' : ''}`}
            onClick={undoAction}
            disabled={!canUndo}
          >
            <Undo size={18} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${!canRedo ? 'opacity-50' : ''}`}
            onClick={redoAction}
            disabled={!canRedo}
          >
            <Redo size={18} />
          </button>
        </div>
        
        {/* Text Style Section */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            className={`p-1 hover:bg-gray-100 rounded ${
              currentCell?.style.bold ? 'bg-gray-200' : ''
            }`}
            onClick={() => handleStyleChange({ bold: !currentCell?.style.bold })}
          >
            <Bold size={18} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${
              currentCell?.style.italic ? 'bg-gray-200' : ''
            }`}
            onClick={() => handleStyleChange({ italic: !currentCell?.style.italic })}
          >
            <Italic size={18} />
          </button>
        </div>

        {/* Text Alignment Section */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            className={`p-1 hover:bg-gray-100 rounded ${
              currentCell?.style.textAlign === 'left' ? 'bg-gray-200' : ''
            }`}
            onClick={() => handleStyleChange({ textAlign: 'left' })}
          >
            <AlignLeft size={18} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${
              currentCell?.style.textAlign === 'center' ? 'bg-gray-200' : ''
            }`}
            onClick={() => handleStyleChange({ textAlign: 'center' })}
          >
            <AlignCenter size={18} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${
              currentCell?.style.textAlign === 'right' ? 'bg-gray-200' : ''
            }`}
            onClick={() => handleStyleChange({ textAlign: 'right' })}
          >
            <AlignRight size={18} />
          </button>
        </div>

        {/* Font Controls Section */}
        <div className="flex items-center gap-2 border-r pr-2">
          <div className="flex items-center gap-1">
            <Type size={18} />
            <select
              className="border rounded p-1"
              value={currentCell?.style.fontSize || 14}
              onChange={(e) => handleStyleChange({ fontSize: Number(e.target.value) })}
            >
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <select
              className="border rounded p-1"
              value={currentCell?.style.fontFamily || 'Arial, sans-serif'}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Color Controls Section */}
        <div className="flex items-center gap-2 border-r pr-2">
          <div className="flex items-center gap-1" title="Text Color">
            <Palette size={18} />
            <input
              type="color"
              value={currentCell?.style.color || '#000000'}
              onChange={(e) => handleStyleChange({ color: e.target.value })}
              className="w-6 h-6 p-0 border-0"
            />
          </div>

          <div className="flex items-center gap-1" title="Background Color">
            <Square size={18} />
            <input
              type="color"
              value={currentCell?.style.backgroundColor || '#ffffff'}
              onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
              className="w-6 h-6 p-0 border-0"
            />
          </div>
        </div>

        {/* Find & Replace Button */}
        <div className="flex items-center gap-1">
          <button
            className={`p-1 hover:bg-gray-100 rounded ${
              findReplaceOpen ? 'bg-gray-200' : ''
            }`}
            onClick={() => setFindReplaceOpen(!findReplaceOpen)}
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Find & Replace Panel */}
      {findReplaceOpen && (
        <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="border rounded p-1 mr-2"
            />
            <input
              type="text"
              placeholder="Replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="border rounded p-1 mr-2"
            />
            <button
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleFindReplace}
            >
              Replace All
            </button>
            <button
              className="ml-2 p-1 hover:bg-gray-200 rounded"
              onClick={() => setFindReplaceOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};