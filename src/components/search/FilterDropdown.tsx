import React, { useState, useCallback } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = useCallback((value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  }, [selectedValues, onSelectionChange]);

  return (
    <div className="multi-select-container">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="border rounded-lg bg-white">
        <div className="p-2 border-b">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            className="w-full p-1 text-sm border rounded"
          />
        </div>
        <div className="overflow-y-auto" style={{ height: '100px' }}>
          {filteredOptions.map(option => (
            <label
              key={option.value}
              className="flex items-center px-3 py-1 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="mr-2"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;