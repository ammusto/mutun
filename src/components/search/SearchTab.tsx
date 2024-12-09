import React, { useCallback } from 'react';
import SimpleSearch from './SimpleSearch';
import AdvancedSearch from './AdvancedSearch';
import ProximitySearch from './ProximitySearch';
import { useSearch } from '../contexts/SearchContext';
import { useSearchForm } from '../contexts/SearchFormContext';
import { parseSearchParams } from '../utils/searchParamsUtil';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { SearchConfig, SearchType } from '../../types';

interface SearchTabProps {
  onSearch: (config: SearchConfig, selectedTexts: number[]) => void;
}

const SearchTab: React.FC<SearchTabProps> = ({ onSearch }) => {
  const hasInitialized = React.useRef(false);
  const [searchParams] = useSearchParams();
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

  // Add validateConfig function
  const validateConfig = useCallback((config: SearchConfig): boolean => {
    switch (config.searchType) {
      case 'simple': {
        if (Array.isArray(config.searchFields) && config.searchFields[0]) {
          if (!config.searchFields[0].term.trim()) {
            toast.error('Please enter a search term');
            return false;
          }
        } else {
          toast.error('Invalid search configuration');
          return false;
        }
        break;
      }
      case 'advanced': {
        if (Array.isArray(config.searchFields)) {
          const hasValidTerm = config.searchFields.some(field => field.term.trim());
          if (!hasValidTerm) {
            toast.error('Please enter at least one search term');
            return false;
          }
        } else {
          toast.error('Invalid advanced search configuration');
          return false;
        }
        break;
      }
      case 'proximity': {
        if (typeof config.searchFields === 'object' && config.searchFields !== null &&
            'firstTerm' in config.searchFields && 'secondTerm' in config.searchFields) {
          if (!config.searchFields.firstTerm.term.trim() || 
              !config.searchFields.secondTerm.term.trim()) {
            toast.error('Please enter both search terms for proximity search');
            return false;
          }
        } else {
          toast.error('Invalid proximity search configuration');
          return false;
        }
        break;
      }
      default:
        toast.error('Invalid search type');
        return false;
    }
    return true;
  }, []);

  const initializeFromParams = useCallback(() => {
    if (hasInitialized.current || !searchParams.has('type')) return;
    hasInitialized.current = true;

    const { config } = parseSearchParams(searchParams);
    
    // Validate search type
    if (config.searchType === 'simple' || 
        config.searchType === 'advanced' || 
        config.searchType === 'proximity') {
      setSearchType(config.searchType);
    }

    // Handle simple search
    if (config.searchType === 'simple' && Array.isArray(config.searchFields)) {
      const field = config.searchFields[0];
      if (field) {
        handleSimpleFieldChange('term', field.term);
        handleSimpleFieldChange('searchIn', field.searchIn);
        handleSimpleFieldChange('definite', field.definite);
        handleSimpleFieldChange('proclitic', field.proclitic);
      }
    }
    
    // Handle advanced search
    else if (config.searchType === 'advanced' && Array.isArray(config.searchFields)) {
      const andFields = config.searchFields.filter(f => f.tabType === 'AND');
      const orFields = config.searchFields.filter(f => f.tabType === 'OR');
      
      // Add necessary fields first
      if (andFields.length > searchFormState.advanced.andFields.length) {
        const fieldsToAdd = andFields.length - searchFormState.advanced.andFields.length;
        for (let i = 0; i < fieldsToAdd; i++) {
          addAdvancedField('AND');
        }
      }
      
      if (orFields.length > searchFormState.advanced.orFields.length) {
        const fieldsToAdd = orFields.length - searchFormState.advanced.orFields.length;
        for (let i = 0; i < fieldsToAdd; i++) {
          addAdvancedField('OR');
        }
      }
      
      // Then populate the fields
      requestAnimationFrame(() => {
        andFields.forEach((field, index) => {
          handleAdvancedFieldChange(index, 'term', field.term, 'AND');
          handleAdvancedFieldChange(index, 'searchIn', field.searchIn, 'AND');
          handleAdvancedFieldChange(index, 'definite', field.definite, 'AND');
          handleAdvancedFieldChange(index, 'proclitic', field.proclitic, 'AND');
        });

        orFields.forEach((field, index) => {
          handleAdvancedFieldChange(index, 'term', field.term, 'OR');
          handleAdvancedFieldChange(index, 'searchIn', field.searchIn, 'OR');
          handleAdvancedFieldChange(index, 'definite', field.definite, 'OR');
          handleAdvancedFieldChange(index, 'proclitic', field.proclitic, 'OR');
        });
      });
    }
    
    // Handle proximity search
    else if (config.searchType === 'proximity' && 
             typeof config.searchFields === 'object' && 
             config.searchFields !== null &&
             'firstTerm' in config.searchFields &&
             'secondTerm' in config.searchFields &&
             'slop' in config.searchFields) {
      
      const { firstTerm, secondTerm, slop } = config.searchFields;

      // Populate first term
      handleProximityFieldChange(0, 'term', firstTerm.term);
      handleProximityFieldChange(0, 'searchIn', firstTerm.searchIn);
      handleProximityFieldChange(0, 'definite', firstTerm.definite);
      handleProximityFieldChange(0, 'proclitic', firstTerm.proclitic);

      // Populate second term
      handleProximityFieldChange(1, 'term', secondTerm.term);
      handleProximityFieldChange(1, 'searchIn', secondTerm.searchIn);
      handleProximityFieldChange(1, 'definite', secondTerm.definite);
      handleProximityFieldChange(1, 'proclitic', secondTerm.proclitic);

      handleSlopChange(slop);
    }
  }, [
    searchParams,
    setSearchType,
    handleSimpleFieldChange,
    handleAdvancedFieldChange,
    handleProximityFieldChange,
    handleSlopChange,
    addAdvancedField,
    searchFormState.advanced.andFields.length,
    searchFormState.advanced.orFields.length
  ]);

  // Run initialization only once
  React.useEffect(() => {
    initializeFromParams();
  }, [initializeFromParams]);

  const handleTypeChange = useCallback((newType: SearchType) => {
    setSearchType(newType);
  }, [setSearchType]);

  const createSearchConfig = useCallback((): SearchConfig | null => {
    switch (searchFormState.searchType) {
      case 'simple': {
        const field = { ...searchFormState.simple };
        return {
          searchType: 'simple',
          searchFields: [field]
        };
      }
      case 'advanced': {
        const allFields = [
          ...searchFormState.advanced.andFields,
          ...searchFormState.advanced.orFields
        ];
        return {
          searchType: 'advanced',
          searchFields: allFields
        };
      }
      case 'proximity': {
        const { firstTerm, secondTerm, slop } = searchFormState.proximity;
        return {
          searchType: 'proximity',
          searchFields: { firstTerm, secondTerm, slop }
        };
      }
      default:
        return null;
    }
  }, [searchFormState]);

  const handleSearchClick = useCallback(() => {
    const searchConfig = createSearchConfig();
    if (!searchConfig) {
      toast.error('Invalid search configuration');
      return;
    }

    // Validate before executing search
    if (validateConfig(searchConfig)) {
      onSearch(searchConfig, selectedTexts);
      handleSearch(searchConfig, selectedTexts, 1);
    }
  }, [createSearchConfig, validateConfig, selectedTexts, onSearch, handleSearch]);

  const searchTypes: SearchType[] = ['simple', 'advanced', 'proximity'];

  return (
    <div className="search-tab-container">
      <div className="search-tabs">
        {searchTypes.map((type) => (
          <button
            key={type}
            className={`search-tab ${searchFormState.searchType === type ? 'active' : ''}`}
            onClick={() => handleTypeChange(type)}
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

export default React.memo(SearchTab);