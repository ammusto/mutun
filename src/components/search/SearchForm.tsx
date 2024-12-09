import React, { useCallback, useState, useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';
import FilterTab from './FilterTab';
import SearchTab from './SearchTab';
import { useSearchForm } from '../contexts/SearchFormContext';
import { SearchFormProps } from '../../types';  // Importing the types from types.ts

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onResetSearch,
  initialTextIds = [],
}) => {
  const {
    setSelectedTexts,
    resetSearch,
    resetSelection,
    hasSearched,
  } = useSearch();

  const { resetSearchForm } = useSearchForm();
  const [activeTab, setActiveTab] = useState<'select' | 'search'>('select');
  const [inititalLoad, setInititalLoad] = useState(false)

  useEffect(() => {
    if (hasSearched) {
      if (!inititalLoad) {
        setActiveTab('search');
      }
      if (initialTextIds.length > 0) {
        setSelectedTexts(initialTextIds);
      }
      setInititalLoad(true)
    }
  }, [hasSearched, inititalLoad, setSelectedTexts, initialTextIds]);

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
