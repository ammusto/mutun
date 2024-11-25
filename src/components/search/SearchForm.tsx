import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSearch } from '../contexts/SearchContext';
import FilterTab from './FilterTab';
import SearchTab from './SearchTab';
import { useSearchForm } from '../contexts/SearchFormContext';
import { SearchFormProps } from '../../types';  // Importing the types from types.ts

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onResetSearch,
  initialQuery = '',
  initialTextIds = [],
}) => {
  const {
    setSelectedTexts,
    resetSearch,
    resetSelection
  } = useSearch();

  const { resetSearchForm } = useSearchForm();
  const [activeTab, setActiveTab] = useState<'select' | 'search'>('select');
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      if (initialQuery !== '') {
        setActiveTab('search');
      }
      if (initialTextIds.length > 0) {
        setSelectedTexts(initialTextIds);
      }
      isInitialMount.current = false;
    }
  }, [initialQuery, initialTextIds, setSelectedTexts]);

  const handleTabChange = useCallback((tab: 'select' | 'search') => {
    setActiveTab(tab);
  }, []);

  const handleReset = useCallback(() => {
    resetSearch();
    onResetSearch();
    resetSearchForm();
  }, [resetSearch, onResetSearch, resetSearchForm]);

  return (
    <div className="search-form-container">
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'select' ? 'active' : ''}`}
          onClick={() => handleTabChange('select')}
        >
          Select Texts
        </button>
        <button
          className={`search-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleTabChange('search')}
        >
          Search
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'select' && (
          <FilterTab
            initialTextIds={initialTextIds}
            resetSelection={resetSelection}
          />
        )}
        {activeTab === 'search' && (
          <SearchTab onSearch={onSearch} />
        )}
      </div>

      <div className='flex search-button-container'>
        <button
          type="button"
          className='reset-button'
          onClick={handleReset}
        >
          Reset Form and Clear Results
        </button>
      </div>
    </div>
  );
};

export default React.memo(SearchForm);
