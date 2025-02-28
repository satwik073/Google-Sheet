import React, { useState, useEffect } from 'react';
import { useSheetStore } from '../store/useSheetStore';

export const FormulaBar: React.FC = () => {
  const { selectedCell, cells, setCellFormula } = useSheetStore();
  const [formula, setFormula] = useState('');

  useEffect(() => {
    if (selectedCell && cells[selectedCell]) {
      setFormula(cells[selectedCell].formula || cells[selectedCell].value);
    } else {
      setFormula('');
    }
  }, [selectedCell, cells]);

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value);
  };

  const handleFormulaSubmit = () => {
    if (!selectedCell) return;

    if (formula.startsWith('=')) {
      setCellFormula(selectedCell, formula);
    } else {
      setCellFormula(selectedCell, formula);
    }
  };

  return (
    <div className="flex items-center pb-3 px-2p-0 border-b ">
      <div className="font-mono w-[5%] bg-white text-black px-3  border-r border-[#dcdfe1]">
        {selectedCell || ''}
      </div>
      <input
        className="flex-1 px-4 py-1 rounded-md focus:outline-none focus:ring-0 focus:ring-offset-transparent"
        value={formula}
        onChange={handleFormulaChange}
        onBlur={handleFormulaSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFormulaSubmit();
          }
        }}
        placeholder="Enter a value or formula (start with =)"
      />
    </div>
  );
};
