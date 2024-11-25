import React, { useState, useEffect, useRef, useMemo, useCallback, FC } from 'react';
import { Option } from '../../types';
import './FilterDropdown.css';

interface FilterDropdownProps {
  label: string;
  options: Option[];
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
  onReset: () => void;
  alphabetical?: boolean;
}

const FilterDropdown: FC<FilterDropdownProps> = ({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  onReset,
  alphabetical = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeOptions = useMemo(() => Array.isArray(options) ? options : [], [options]);
  const safeSelectedOptions = useMemo(() => Array.isArray(selectedOptions) ? selectedOptions : [], [selectedOptions]);

  const processedOptions = useMemo(() => {
    const processed = [...safeOptions];
    if (alphabetical) {
      return processed.sort((a, b) => {
        const labelA = a && typeof a === 'object' && a.label ? String(a.label) : '';
        const labelB = b && typeof b === 'object' && b.label ? String(b.label) : '';
        return labelA.localeCompare(labelB);
      });
    }
    return processed;
  }, [safeOptions, alphabetical]);

  const filteredOptions = useMemo(() => {
    return processedOptions.filter(option => {
      if (option == null) return false;
      const optionLabel = option && typeof option === 'object' && option.label ? String(option.label) : String(option);
      return optionLabel.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [processedOptions, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = useCallback((option: Option) => {
    if (option == null) return;
    const optionValue = typeof option === 'object' ? option.value : option;
    const newSelectedOptions = safeSelectedOptions.includes(optionValue)
      ? safeSelectedOptions.filter(item => item !== optionValue)
      : [...safeSelectedOptions, optionValue];
    onSelectionChange(newSelectedOptions);
    setSearchTerm('');
  }, [safeSelectedOptions, onSelectionChange]);

  const handleUnselectAll = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    onReset();
    setSearchTerm('');
  }, [onReset]);

  const getSelectedLabels = useCallback(() => {
    return safeSelectedOptions.map(value => {
      const option = safeOptions.find(opt =>
        (typeof opt === 'object' ? opt.value : opt) === value
      );
      return option && typeof option === 'object' ? String(option.label) : String(option);
    }).filter(Boolean);
  }, [safeOptions, safeSelectedOptions]);

  const selectedLabels = useMemo(() => getSelectedLabels(), [getSelectedLabels]);

  const displayText = useMemo(() =>
    selectedLabels.length > 0
      ? `${selectedLabels.join(', ')} (${selectedLabels.length})`
      : 'Select options',
    [selectedLabels]
  );

  return (
    <div className="filter-dropdown" ref={dropdownRef} id="filter-dropdown">
      <label id="filter-dropdown-label">{label}</label>
      <div className="search-input-container">
        <input
          id="filter-dropdown-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder={displayText}
          aria-labelledby="filter-dropdown-label"
        />
      </div>
      {isOpen && (
        <div className="dropdown-content" id="filter-dropdown-content">
          <button id="unselect-all-button" className="text-button" onClick={handleUnselectAll}>
            Unselect All
          </button>
          {filteredOptions.map((option, index) => {
            if (option == null) return null;
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? String(option.label) : String(option);
            const optionId = `${optionValue || index}`;
            return (
              <div key={optionId} className="option-container">
                <label htmlFor={optionId}>
                  <input
                    id={optionId}
                    type="checkbox"
                    checked={safeSelectedOptions.includes(optionValue)}
                    onChange={() => handleToggle(option)}
                  />
                  {optionLabel}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(FilterDropdown);
