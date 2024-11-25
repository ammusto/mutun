import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { useSearch } from '../contexts/SearchContext';
import { useMetadata } from '../contexts/metadataContext';
import { Text, TextFilterListProps } from '../../types';
import LoadingGif from '../utils/LoadingGif';

const WINDOW_SIZE = 100;

const TextFilterList: React.FC<TextFilterListProps> = ({ disabledTexts, onResetSelection }) => {
  const {
    filteredTexts,
    selectedTexts,
    setSelectedTexts,
    setSelectedTextDetails,
    isMetadataLoading,
    resetSelection,
    textFilter,
    selectedGenres,
    selectedCollections,
    dateRange
  } = useSearch();

  const { sortedTextsCache } = useMetadata();
  const [displayedTexts, setDisplayedTexts] = useState<Text[]>([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if any filters are active
  useEffect(() => {
    setHasActiveFilters(
      textFilter !== '' ||
      selectedGenres.length > 0 ||
      selectedCollections.length > 0 ||
      (dateRange?.current && (
        dateRange.current[0] !== dateRange.min ||
        dateRange.current[1] !== dateRange.max
      ))
    );
  }, [textFilter, selectedGenres, selectedCollections, dateRange]);

  // Modified to handle "no matches" case properly
  const baseTexts = useMemo(() => {
    if (hasActiveFilters) {
      return filteredTexts || [];
    }
    return sortedTextsCache || [];
  }, [filteredTexts, sortedTextsCache, hasActiveFilters]);

  useEffect(() => {
    if (baseTexts.length > WINDOW_SIZE) {
      setDisplayedTexts(baseTexts.slice(0, WINDOW_SIZE));
      const timer = setTimeout(() => {
        setDisplayedTexts(baseTexts);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayedTexts(baseTexts);
    }
  }, [baseTexts]);

  const handleTextToggle = useCallback((text: Text) => {
    const isSelected = selectedTexts.includes(text.id);
    if (isSelected) {
      setSelectedTexts(prev => prev.filter(id => id !== text.id));
      setSelectedTextDetails(prev => prev.filter(t => t.id !== text.id));
    } else {
      setSelectedTexts(prev => [...prev, text.id]);
      setSelectedTextDetails(prev => {
        const newDetail = { 
          id: text.id, 
          title: text.title_ar, 
          author: text.author_sh_ar, 
          author_long: text.author_ar, 
          date: text.date 
        };
        return prev.some(t => t.id === newDetail.id) ? prev : [...prev, newDetail];
      });
    }
  }, [selectedTexts, setSelectedTexts, setSelectedTextDetails]);

  const handleRemoveAll = useCallback(() => {
    setSelectedTexts([]);
    setSelectedTextDetails([]);
  }, [setSelectedTexts, setSelectedTextDetails]);

  const handleAddAll = useCallback(() => {
    const textsToAdd = displayedTexts.filter(text => !selectedTexts.includes(text.id));
    setSelectedTexts(prev => [...prev, ...textsToAdd.map(t => t.id)]);
    setSelectedTextDetails(prev => {
      const newDetails = textsToAdd.map(t => ({
        id: t.id,
        title: t.title_ar,
        author: t.author_sh_ar,
        author_long: t.author_ar,
        date: t.date
      }));
      return [...prev, ...newDetails.filter(newDetail =>
        !prev.some(existingDetail => existingDetail.id === newDetail.id)
      )];
    });
  }, [displayedTexts, selectedTexts, setSelectedTexts, setSelectedTextDetails]);

  const cache = useMemo(() => new CellMeasurerCache({
    defaultHeight: 35,
    fixedWidth: true
  }), []);

  const RowRenderer = useCallback(({ index, key, style, parent }: {
    index: number;
    key: string;
    style: React.CSSProperties;
    parent: any;
  }) => {
    const text = displayedTexts[index];
    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div style={style} className="virtual-row">
          <label>
            <input
              type="checkbox"
              checked={selectedTexts.includes(text.id)}
              onChange={() => handleTextToggle(text)}
            />
            <span>
              {text.title_ar} - {text.author_sh_ar} ({text.date})
            </span>
          </label>
        </div>
      </CellMeasurer>
    );
  }, [displayedTexts, selectedTexts, handleTextToggle, cache]);

  const isDisabled = isMetadataLoading || displayedTexts.length === 0;

  return (
    <div className="filter-container">
      <div className="filter-actions center">
        <strong>Select Texts </strong>
        (
        <button
          type="button"
          onClick={handleAddAll}
          className="text-button"
          disabled={isDisabled}
        >
          Add All
        </button>
        /
        <button
          type="button"
          onClick={handleRemoveAll}
          className="text-button"
          disabled={isDisabled || selectedTexts.length === 0}
        >
          Remove All
        </button>
        )
      </div>

      <div className="text-filter-list">
        {isMetadataLoading ? (
          <div className="no-texts center"><LoadingGif /></div>
        ) : hasActiveFilters && displayedTexts.length === 0 ? (
          <div className="no-texts center">No matches found for current filters</div>
        ) : !hasActiveFilters && displayedTexts.length === 0 ? (
          <div className="no-texts center">No texts available</div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                rowCount={displayedTexts.length}
                rowHeight={cache.rowHeight}
                deferredMeasurementCache={cache}
                rowRenderer={RowRenderer}
                overscanRowCount={5}
              />
            )}
          </AutoSizer>
        )}
      </div>

      {selectedTexts.length > 0 && (
        <button
          type="button"
          className="reset-button"
          onClick={resetSelection}
        >
          Clear Selected Texts
        </button>
      )}
    </div>
  );
};

export default React.memo(TextFilterList);