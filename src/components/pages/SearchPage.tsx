import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { useAuth0 } from '@auth0/auth0-react';
import SearchForm from '../search/SearchForm';
import Results from '../search/Results';
import DownloadButton from '../search/DownloadButton';
import { buildSearchParams, parseSearchParams } from '../utils/searchParamsUtil';
import { userDataService } from '../services/userDataService';
import { SearchConfig } from '../../types';
import SearchResultsSkeleton from 'components/search/SearchResultsSkeleton';
import './Search.css';

const SearchPage: React.FC = () => {
  const { user } = useAuth0();
  const auth0UserId = user?.sub;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchFormOpen, setIsSearchFormOpen] = useState<boolean>(true);
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    searchType: 'simple',
    searchFields: [{
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false
    }]
  });
  const isInitialLoad = useRef(true);
  const initialLoadRef = useRef(true);
  const isProcessingUrlRef = useRef(false);

  const {
    displayedResults,
    totalResults,
    isSearching,
    hasSearched,
    handleSearch,
    handlePageChange,
    currentPage,
    totalPages,
    resetSearch,
    isChangingPage,
    selectedTexts,
    currentSearchConfig,
    ITEMS_PER_PAGE
  } = useSearch();


  useEffect(() => {
    if (isInitialLoad.current && searchParams.has('type')) {
      const { config, page, textIds } = parseSearchParams(searchParams);
      setSearchConfig(config);
      handleSearch(config, textIds, page);
      isInitialLoad.current = false;
    }
  }, [searchParams, handleSearch]);

  // Handle page changes from URL
  useEffect(() => {
    if (initialLoadRef.current || isProcessingUrlRef.current) return;
    
    if (currentSearchConfig && searchParams.has('page')) {
      const page = parseInt(searchParams.get('page') || '1', 10);
      handlePageChange(page);
    }
  }, [searchParams, currentSearchConfig, handlePageChange]);


  // Add search to history when search completes
  useEffect(() => {
    const addSearchToHistory = async () => {
      if (hasSearched && !isSearching && auth0UserId && totalResults > 0) {
        try {
          await userDataService.addToSearchHistory(
            auth0UserId,
            searchParams.toString(),
            totalResults
          );
        } catch (error) {
          console.error('Failed to add search to history:', error);
        }
      }
    };



    addSearchToHistory();
  }, [hasSearched, isSearching, auth0UserId, totalResults, searchParams]);

  const handleSearchSubmit = useCallback(async (newConfig: SearchConfig, texts: number[]) => {
    // First update local state
    setSearchConfig(newConfig);
    setIsSearchFormOpen(false);

    // Then update URL and trigger search
    const newSearchParams = buildSearchParams(newConfig, texts, 1);
    setSearchParams(newSearchParams, { replace: true });
    await handleSearch(newConfig, texts, 1);
  }, [setSearchParams, handleSearch]);

  const handlePageChangeWrapper = useCallback((newPage: number) => {
    handlePageChange(newPage);
    if (currentSearchConfig) {
      const newSearchParams = buildSearchParams(currentSearchConfig, selectedTexts, newPage);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [handlePageChange, currentSearchConfig, selectedTexts, setSearchParams]);

  const handleResetSearch = useCallback(() => {
    resetSearch();
    setSearchParams({});
    setIsSearchFormOpen(true);
    setSearchConfig({
      searchType: 'simple',
      searchFields: [{
        term: '',
        searchIn: 'tok',
        definite: false,
        proclitic: false
      }]
    });
  }, [resetSearch, setSearchParams]);

  const handleSaveSearch = useCallback(async () => {
    try {
      const searchName = prompt('Enter a name for this search:');
      if (searchName) {
        const searchData = {
          name: searchName,
          query: searchParams.toString(),
          resultsCount: totalResults
        };
        if (!auth0UserId) {
          throw new Error('User ID is undefined');
        }
        await userDataService.saveSearch(auth0UserId, searchData);
        alert('Search saved successfully');
      }
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }, [searchParams, auth0UserId, totalResults]);

  const memoizedContent = useMemo(() => (
    <>
      <SearchForm
        onResetSearch={handleResetSearch}
        onSearch={handleSearchSubmit}
        searchConfig={searchConfig}
        setSearchConfig={setSearchConfig}
        isOpen={isSearchFormOpen}
        onToggle={() => setIsSearchFormOpen(prev => !prev)}
      />


      {(isSearching || isChangingPage) && <SearchResultsSkeleton />}


      {!isSearching && !isChangingPage && hasSearched && (
        <Results
          displayedResults={displayedResults}
          currentPage={currentPage}
          totalResults={totalResults}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChangeWrapper}
        />
      )}

      {displayedResults.length > 0 && !isSearching && (
        <>
          <DownloadButton />
          <button onClick={handleSaveSearch} className="save-search-button">
            Save Search
          </button>
        </>
      )}
    </>
  ), [
    ITEMS_PER_PAGE,
    displayedResults,
    currentPage,
    totalResults,
    totalPages,
    isSearching,
    isChangingPage,
    hasSearched,
    searchConfig,
    isSearchFormOpen,
    handleSearchSubmit,
    handleResetSearch,
    handlePageChangeWrapper,
    handleSaveSearch
  ]);

  return (
    <div className='container'>
      <div className='main'>
        {memoizedContent}
      </div>
    </div>
  );
};

export default React.memo(SearchPage);