//@ts-nocheck
import React, { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
  Undo,
  Redo,
  Square,
  X,
  Minus,
  Plus,
  PaintBucket
} from 'lucide-react';
import CustomText from '../types/CustomText';

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

  // Available font sizes array
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

  const handleStyleChange = (styleUpdate: any) => {
    if (!selectedCell) return;
    setCellStyle(selectedCell, styleUpdate);
  };

  const handleFindReplace = () => {
    findAndReplace(findText, replaceText);
    setFindReplaceOpen(false);
  };

  const currentCell = selectedCell ? cells[selectedCell] : null;
  const currentFontSize = currentCell?.style.fontSize || 14;

  // Function to increase font size to the next size in the array
  const increaseFontSize = () => {
    const currentIndex = fontSizes.indexOf(currentFontSize);
    if (currentIndex < fontSizes.length - 1) {
      const newSize = fontSizes[currentIndex + 1];
      handleStyleChange({ fontSize: newSize });
    }
  };

  // Function to decrease font size to the previous size in the array
  const decreaseFontSize = () => {
    const currentIndex = fontSizes.indexOf(currentFontSize);
    if (currentIndex > 0) {
      const newSize = fontSizes[currentIndex - 1];
      handleStyleChange({ fontSize: newSize });
    }
  };

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
    <div className="flex flex-col mb-1 mx-6">
      <div className="flex bg-[#f0f4f9] rounded-full items-center gap-5 p-1 ">
        {/* Undo/Redo Section */}
        <div className="flex items-center gap-1 border-r pr-2">
          <div className="flex items-center gap-1">
            <button
              className={`p-2 px-5 rounded-full mx-2 hover:bg-gray-100 bg-white text-sm flex items-center gap-2 ${findReplaceOpen ? 'bg-gray-200' : ''}`}
              onClick={() => setFindReplaceOpen(!findReplaceOpen)}
            >
              <Search size={16} /> Menus
            </button>
          </div>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${!canUndo ? 'opacity-50' : ''}`}
            onClick={undoAction}
            disabled={!canUndo}
          >
            <Undo size={16} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${!canRedo ? 'opacity-50' : ''}`}
            onClick={redoAction}
            disabled={!canRedo}
          >
            <Redo size={16} />
          </button>
        </div>

        {/* Text Style Section */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.bold ? 'bg-gray-200' : ''}`}
            onClick={() => handleStyleChange({ bold: !currentCell?.style.bold })}
          >
            <Bold size={16} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.italic ? 'bg-gray-200' : ''}`}
            onClick={() => handleStyleChange({ italic: !currentCell?.style.italic })}
          >
            <Italic size={16} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.underline ? 'bg-gray-200' : ''}`}
            onClick={() => handleStyleChange({ underline: !currentCell?.style.underline })}
          >
            <Underline size={16} />
          </button>
          <button
            className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.strikethrough ? 'bg-gray-200' : ''}`}
            onClick={() => handleStyleChange({ strikethrough: !currentCell?.style.strikethrough })}
          >
            <Strikethrough size={16} />
          </button>
        </div>

        {/* Text Alignment Section */}
        <div className="flex items-center border-r gap-5 pr-2">
          <div className="flex bg-[#f0f4f9] rounded-full items-center gap-2 p-2 ">
            <button
              className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.textAlign === 'left' ? 'bg-gray-200' : ''}`}
              onClick={() => handleStyleChange({ textAlign: 'left' })}
            >
              <AlignLeft size={16} />
            </button>
            <button
              className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.textAlign === 'center' ? 'bg-gray-200' : ''}`}
              onClick={() => handleStyleChange({ textAlign: 'center' })}
            >
              <AlignCenter size={16} />
            </button>
            <button
              className={`p-1 hover:bg-gray-100 rounded ${currentCell?.style.textAlign === 'right' ? 'bg-gray-200' : ''}`}
              onClick={() => handleStyleChange({ textAlign: 'right' })}
            >
              <AlignRight size={16} />
            </button>
          </div>
        </div>

        {/* Font Controls Section */}
        <div className="flex items-center gap-2 border-r pr-2">
          <div className="flex items-center gap-5">
            <div className='mx-3 flex items-center gap-2'>
              <button 
                className="p-1 hover:bg-gray-100 rounded" 
                onClick={decreaseFontSize}
                disabled={fontSizes.indexOf(currentFontSize) === 0}
              >
                <Minus size={16} />
              </button>
              
              <select
                className="border rounded p-1 custom-select"
                value={currentFontSize}
                onChange={(e) => handleStyleChange({ fontSize: Number(e.target.value) })}
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size} className='text-center'>
                    {size}
                  </option>
                ))}
              </select>
              
              <button 
                className="p-1 hover:bg-gray-100 rounded" 
                onClick={increaseFontSize}
                disabled={fontSizes.indexOf(currentFontSize) === fontSizes.length - 1}
              >
                <Plus size={16} />
              </button>
            </div>
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
          <div className="flex items-center flex-col " title="Text Color">
            <CustomText type='H1' style={{ fontWeight: 'normal' }}>A</CustomText>
            <input
              type="color"
              value={currentCell?.style.color || '#000000'}
              onChange={(e) => handleStyleChange({ color: e.target.value })}
              className="w-9 h-3 -mt-2 p-0 border-0"
            />
          </div>

          <div className="flex items-center flex-col gap-3 mt-0.5" title="Background Color">
            <PaintBucket size={16} className='-mb-2 pt-1' />
            <input
              type="color"
              value={currentCell?.style.backgroundColor || '#ffffff'}
              onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
              className="w-9 h-3 p-0 border-0"
            />
          </div>
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