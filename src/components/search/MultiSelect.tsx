import React, { useState, useMemo } from 'react';
import LoadingGif from '../utils/LoadingGif';
import { Option } from '../../types';
import './MultiSelect.css';

interface MultiSelectProps {
    label: string;
    options: Option[];
    selectedOptions: string[];
    onSelectionChange: (options: string[]) => void;
    onReset: () => void;
    alphabetical?: boolean;
    language?: 'ar' | 'en';
    isLoading?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    selectedOptions,
    onSelectionChange,
    onReset,
    alphabetical = true,
    language = 'en',
    isLoading = false
}) => {
    const [filter, setFilter] = useState<string>('');

    const displayedOptions = useMemo(() => {
        let filtered = [...options];

        // Apply alphabetical sorting if needed
        if (alphabetical) {
            filtered = filtered.sort((a, b) => {
                const labelA = a && typeof a === 'object' && a.label ? String(a.label) : '';
                const labelB = b && typeof b === 'object' && b.label ? String(b.label) : '';
                return labelA.localeCompare(labelB);
            });
        }

        // Apply text filter if present
        if (filter) {
            filtered = filtered.filter(option => {
                const label = option && typeof option === 'object' && option.label
                    ? String(option.label).toLowerCase()
                    : String(option).toLowerCase();
                return label.includes(filter.toLowerCase());
            });
        }

        return filtered;
    }, [options, filter, alphabetical]);

    const handleOptionChange = (option: Option) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const isSelected = selectedOptions.includes(optionValue);

        if (isSelected) {
            onSelectionChange(selectedOptions.filter(selected => selected !== optionValue));
        } else {
            onSelectionChange([...selectedOptions, optionValue]);
        }
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };

    return (
        <div className="multiselect-box br10">
            <div className="multiselect-header center">
                <strong>{label} </strong>
                {selectedOptions.length > 0 && (
                    <button
                        onClick={onReset}
                        className="text-button reset-button"
                        style={{ marginLeft: 'auto' }}
                    >
                        (Reset)
                    </button>
                )}
            </div>
            <div className="multiselect-filter-container">
                <input
                    type="text"
                    value={filter}
                    onChange={handleFilterChange}
                    placeholder="Begin Typing..."
                    className="search-input"
                    disabled={isLoading}
                />
            </div>
            <div className="multiselect-scrollable">
                {isLoading ? (
                    <div className="multiselect-loading">
                        <LoadingGif divs={false} />
                    </div>
                ) : displayedOptions.length === 0 ? (
                    <>
                        {filter ? <div className='center mt10'>No matches found</div> : <LoadingGif divs={true} />}
                    </>
                ) : (
                    displayedOptions.map((option, index) => {
                        const value = typeof option === 'object' ? option.value : option;
                        const label = typeof option === 'object' ? option.label : option;

                        return (
                            <label
                                key={`${value}-${index}`}
                                className={`multiselect-option ${language}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(value)}
                                    onChange={() => handleOptionChange(option)}
                                    className="multiselect-checkbox"
                                />
                                {label}
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default React.memo(MultiSelect);