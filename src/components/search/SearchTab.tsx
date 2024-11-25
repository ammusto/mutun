import React, { useCallback } from 'react';
import SimpleSearch from './SimpleSearch';
import AdvancedSearch from './AdvancedSearch';
import ProximitySearch from './ProximitySearch';
import { useSearch } from '../contexts/SearchContext';
import { useSearchForm } from '../contexts/SearchFormContext';

import {
  SearchConfig,
  SearchField,
  SearchType
} from '../../types';

interface SearchTabProps {
  onSearch: (config: SearchConfig, selectedTexts: number[]) => void;
}

const SearchTab: React.FC<SearchTabProps> = ({ onSearch }) => {
  const { selectedTexts, handleSearch } = useSearch();
  const {
    searchFormState,
    setSearchType,
    handleSimpleFieldChange,
    handleAdvancedFieldChange,
    handleProximityFieldChange,
    handleSlopChange,
    addAdvancedField,
    removeAdvancedField
  } = useSearchForm();

  const handleTypeChange = (newType: SearchType) => {
    setSearchType(newType);
  };

  const createSearchConfig = useCallback((
    searchFields: SearchField[] | null,
    proximityData?: { firstTerm: SearchField; secondTerm: SearchField; slop: number }
  ): SearchConfig => {
    if (proximityData) {
      return {
        searchType: 'proximity',
        searchFields: proximityData
      };
    }
    return {
      searchType: searchFormState.searchType,
      searchFields: searchFields || []
    };
  }, [searchFormState.searchType]);
  const validateConfig = useCallback((config: SearchConfig): boolean => {
    // Add validation logic here
    return true;
  }, []);


  const handleSearchClick = useCallback(() => {
    let searchConfig: SearchConfig | null = null;
  
    switch (searchFormState.searchType) {
      case 'simple': {
        const field = { ...searchFormState.simple };
        searchConfig = createSearchConfig([field]);
        break;
      }
      case 'advanced': {
        const allFields = [
          ...searchFormState.advanced.andFields,
          ...searchFormState.advanced.orFields
        ];
        searchConfig = createSearchConfig(allFields);
        break;
      }
      case 'proximity': {
        const { firstTerm, secondTerm, slop } = searchFormState.proximity;
        searchConfig = createSearchConfig(null, { firstTerm, secondTerm, slop });
        break;
      }
    }
  
    if (searchConfig && validateConfig(searchConfig)) {
      onSearch(searchConfig, selectedTexts);
      handleSearch(searchConfig, selectedTexts, 1);
    }
  }, [
    searchFormState,
    selectedTexts,
    onSearch,
    handleSearch,
    createSearchConfig,
    validateConfig
  ]);

  return (
    <div className="search-tab-container">
      <div className="search-tabs">
        {['simple', 'advanced', 'proximity'].map((type) => (
          <button
            key={type}
            className={`search-tab ${searchFormState.searchType === type ? 'active' : ''}`}
            onClick={() => handleTypeChange(type as SearchType)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Search
          </button>
        ))}
      </div>

      <div className="search-content">
        {searchFormState.searchType === 'simple' && (
          <SimpleSearch
            searchField={searchFormState.simple}
            handleFieldChange={handleSimpleFieldChange}
          />
        )}
        {searchFormState.searchType === 'advanced' && (
          <AdvancedSearch
            andFields={searchFormState.advanced.andFields}
            orFields={searchFormState.advanced.orFields}
            handleFieldChange={handleAdvancedFieldChange}
            addAdvancedField={addAdvancedField}
            removeAdvancedField={removeAdvancedField}
          />
        )}
        {searchFormState.searchType === 'proximity' && (
          <ProximitySearch
            proximityData={searchFormState.proximity}
            handleFieldChange={handleProximityFieldChange}
            handleSlopChange={handleSlopChange}
          />
        )}
      </div>

      <div className='flex search-button-container'>
        <button
          type="submit"
          className='search-button'
          onClick={handleSearchClick}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchTab;