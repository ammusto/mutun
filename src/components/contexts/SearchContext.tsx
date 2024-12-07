import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { performSearch } from '../services/searchService';
import { buildOpenSearchQuery } from '../utils/queryParser';
import { useUnifiedCollections } from './useUnifiedCollections';
import { useMetadata } from './metadataContext';
import type { 
  SearchConfig,
  SearchResult,
  Text,
  TextDetail,
  DateRange,
  SearchContextValue
} from '../../types';

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

const RESULTS_PER_FETCH = 200;
const ITEMS_PER_PAGE = 20;

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { metadata, dateRangeCache, isLoading: isMetadataLoading } = useMetadata();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTexts, setSelectedTexts] = useState<number[]>([]);
  const [selectedTextDetails, setSelectedTextDetails] = useState<TextDetail[]>([]);
  const [textFilter, setTextFilter] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(dateRangeCache || {
    min: 0,
    max: 2000,
    current: [0, 2000]
  });

  const [displayedResults, setDisplayedResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [cachedResults, setCachedResults] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastFetchedPage, setLastFetchedPage] = useState<number>(0);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isChangingPage, setIsChangingPage] = useState<boolean>(false);
  const [highlightQuery, setHighlightQuery] = useState<string>('');
  const [currentSearchConfig, setCurrentSearchConfig] = useState<SearchConfig | null>(null);

  const { textMatchesCollections } = useUnifiedCollections(metadata?.collectionOptions);

  useEffect(() => {
    if (dateRangeCache) {
      setDateRange(dateRangeCache);
    }
  }, [dateRangeCache]);

  const filteredTexts = useMemo(() => {
    if (!metadata?.texts) return [];

    return metadata.texts.filter((text: Text) => {
      const matchesSearch = !textFilter ||
        text.title_ar?.toLowerCase().includes(textFilter.toLowerCase()) ||
        text.title_lat?.toLowerCase().includes(textFilter.toLowerCase()) ||
        text.author_ar?.toLowerCase().includes(textFilter.toLowerCase()) ||
        text.author_lat?.toLowerCase().includes(textFilter.toLowerCase());

      const matchesGenres = selectedGenres.length === 0 || text.tags.some(tag => selectedGenres.includes(tag));
      const matchesCollections = textMatchesCollections(text, selectedCollections);
      const matchesDateRange = (!dateRange?.current || !text.date) ||
        (text.date >= dateRange.current[0] && text.date <= dateRange.current[1]);

      return matchesSearch && matchesGenres && matchesCollections && matchesDateRange;
    });
  }, [metadata, textFilter, selectedGenres, selectedCollections, dateRange, textMatchesCollections]);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const fetchResultsBatch = async (
    searchConfig: SearchConfig,
    searchTexts: number[],
    startPage: number
  ): Promise<{ results: SearchResult[]; totalResults: number }> => {
    const query = buildOpenSearchQuery({
      ...searchConfig,
      selectedTexts: searchTexts
    }, startPage, RESULTS_PER_FETCH, ITEMS_PER_PAGE);
  
    return performSearch(query);
  };

  const handleSearch = useCallback(async (searchConfig: SearchConfig, searchTexts: number[], page = 1): Promise<void> => {
    if (!searchConfig) return;
  
    setIsSearching(true);
    setHasSearched(true);
    setCurrentSearchConfig(searchConfig);
  
    try {
      const results = await fetchResultsBatch(searchConfig, searchTexts, page);
  
      setCachedResults(results.results);
      setDisplayedResults(results.results.slice(0, ITEMS_PER_PAGE));
      setTotalResults(results.totalResults);
      setCurrentPage(page);
  
      const batchPage = Math.ceil(page / (RESULTS_PER_FETCH / ITEMS_PER_PAGE));
      setLastFetchedPage(batchPage * (RESULTS_PER_FETCH / ITEMS_PER_PAGE));
  
      if (searchConfig.searchType === 'simple' && Array.isArray(searchConfig.searchFields)) {
        const firstField = searchConfig.searchFields[0];
        setSearchQuery(firstField?.term || '');
        setHighlightQuery(firstField?.term || '');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setCachedResults([]);
      setDisplayedResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePageChange = useCallback(async (newPage: number): Promise<void> => {
    setIsChangingPage(true);
  
    try {
      const startIndex = (newPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
  
      if (!cachedResults[startIndex] && currentSearchConfig) {
        const batchPage = Math.floor(newPage / (RESULTS_PER_FETCH / ITEMS_PER_PAGE));
        const newResults = await fetchResultsBatch(currentSearchConfig, selectedTexts, batchPage);
        
        setCachedResults(prev => {
          const updated = [...prev];
          const baseIndex = (batchPage * RESULTS_PER_FETCH);
          newResults.results.forEach((result, i) => {
            if (baseIndex + i < 10000) {
              updated.splice(baseIndex + i, 1, result);
            }
          });
          return updated;
        });
      }
  
      setDisplayedResults(cachedResults.slice(startIndex, endIndex));
      setCurrentPage(newPage);
  
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setIsChangingPage(false);
    }
  }, [currentSearchConfig, selectedTexts, cachedResults]);

  const resetSelection = useCallback(() => {
    setSelectedTexts([]);
    setSelectedTextDetails([]);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    resetSelection();
    setTextFilter('');
    setSelectedGenres([]);
    setDateRange(prev => ({
      ...prev,
      current: [prev.min, prev.max]
    }));
    setDisplayedResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setHasSearched(false);
    setHighlightQuery('');
    setCachedResults([]);
    setLastFetchedPage(0);
    setCurrentSearchConfig(null);
    setSelectedCollections([]);
  }, [resetSelection]);

  const value = useMemo(() => ({
    metadata,
    searchQuery,
    setSearchQuery,
    selectedTexts,
    setSelectedTexts,
    selectedTextDetails,
    setSelectedTextDetails,
    textFilter,
    setTextFilter,
    selectedGenres,
    setSelectedGenres,
    selectedCollections,
    setSelectedCollections,
    dateRange,
    setDateRange,
    displayedResults,
    totalResults,
    currentPage,
    isSearching,
    totalPages,
    hasSearched,
    isChangingPage,
    highlightQuery,
    setHighlightQuery,
    filteredTexts,
    cachedResults,
    currentSearchConfig,
    ITEMS_PER_PAGE,
    isMetadataLoading,
    handleSearch,
    handlePageChange,
    resetSearch,
    resetSelection,
  }), [
    metadata,
    searchQuery,
    selectedTexts,
    selectedTextDetails,
    textFilter,
    selectedGenres,
    selectedCollections,
    dateRange,
    displayedResults,
    totalResults,
    currentPage,
    isSearching,
    totalPages,
    hasSearched,
    isChangingPage,
    highlightQuery,
    filteredTexts,
    cachedResults,
    currentSearchConfig,
    isMetadataLoading,
    handleSearch,
    handlePageChange,
    resetSearch,
    resetSelection,
  ]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = (): SearchContextValue => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};