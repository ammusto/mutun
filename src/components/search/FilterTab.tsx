import React from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useUnifiedCollections } from '../contexts/useUnifiedCollections';
import MultiSelect from './MultiSelect';
import TextFilterList from './TextFilterList';
import SelectedTextsList from './SelectedTextsList';
import DateRangeSlider from './DateRangeSlider';
import { SearchContextValue } from '../../types';
import './FilterTab.css';

interface FilterTabProps {
  initialTextIds: number[];
  resetSelection: () => void;
}

const FilterTab: React.FC<FilterTabProps> = ({ initialTextIds, resetSelection }) => {
  const {
    metadata,
    textFilter,
    setTextFilter,
    selectedGenres,
    setSelectedGenres,
    selectedCollections,
    setSelectedCollections
  } = useSearch() as SearchContextValue;

  const { collections } = useUnifiedCollections(
    metadata?.collectionOptions || []
  );

  const handleResetGenres = () => {
    setSelectedGenres([]);
  };

  const handleResetCollections = () => {
    setSelectedCollections([]);
  };

  return (
    <div className="select-texts-container">

      <div className="filter-middle flex">
        <div className="filter-left">
          <div className="filter-container flex">
            <MultiSelect
              label="Select Genres"
              options={metadata?.genreOptions || []}
              selectedOptions={selectedGenres}
              onSelectionChange={setSelectedGenres}
              onReset={handleResetGenres}
              language="en"
            />
            <MultiSelect
              label="Select Collections"
              options={collections || []}
              selectedOptions={selectedCollections}
              onSelectionChange={setSelectedCollections}
              onReset={handleResetCollections}
              alphabetical={false}
              language="en"
            />
            <DateRangeSlider />

          </div>
        </div>
        <div className="filter-right center">
          <div className="column center main-filter-input gap10">
            <strong>Filter Authors and Texts</strong>
            <input
              type="text"
              value={textFilter}
              className="center"
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Filter texts..."
            />
          </div>
          <TextFilterList
            disabledTexts={initialTextIds}
            onResetSelection={resetSelection}
          />
        </div>
      </div>
      <div className="filter-middle flex">
        <div className="filter-container flex">

          <strong className='center'>Selected Texts</strong>
          <SelectedTextsList />
        </div>
      </div>

    </div>
  );
};

export default React.memo(FilterTab);