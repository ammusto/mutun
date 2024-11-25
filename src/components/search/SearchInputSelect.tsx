import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { SearchInputSelectProps } from '../../types'; // Adjust import if necessary
import './SearchInputSelect.css';

const SearchInputSelect: React.FC<SearchInputSelectProps> = ({
  index,
  searchField,
  handleFieldChange,
  searchType,
}) => {
  useEffect(() => {
    if (searchField.searchIn === 'root' && (searchField.definite || searchField.proclitic)) {
      handleFieldChange(index, 'definite', false, searchType);
      handleFieldChange(index, 'proclitic', false, searchType);
    }
  }, [searchField.searchIn, index, handleFieldChange, searchType, searchField.definite, searchField.proclitic]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;  // Type assertion
    const newValue = type === 'checkbox' ? checked : value;

    // Validate proximity search (no phrases allowed)
    if (searchType === 'proximity' && name === 'term' && value.includes(' ')) {
      toast.error('Only single terms allowed for proximity searches.');
      return;
    }

    // Validate root search (no spaces allowed)
    if (name === 'term' && searchField.searchIn === 'root' && value.includes(' ')) {
      toast.error('Spaces are not allowed when searching by Root.');
      return;
    }

    // If switching to root search, disable analyzers
    if (name === 'searchIn' && value === 'root') {
      handleFieldChange(index, 'definite', false, searchType);
      handleFieldChange(index, 'proclitic', false, searchType);
    }

    handleFieldChange(index, name, newValue, searchType);
  };

  return (
    <div className="corpus-search-inputs">
      <div className="input-group">
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              name="definite"
              checked={searchField.definite}
              onChange={handleChange}
              disabled={searchField.searchIn === 'root'}
            />
            D
          </label>
          <label>
            <input
              type="checkbox"
              name="proclitic"
              checked={searchField.proclitic}
              onChange={handleChange}
              disabled={searchField.searchIn === 'root'}
            />
            P
          </label>
        </div>
        <input
          type="text"
          name="term"
          className="arabic center input-overlay-select"
          value={searchField.term}
          onChange={handleChange}
          placeholder={searchField.searchIn === 'root' ? "Enter root..." : "Enter term..."}
        />
        <select
          name="searchIn"
          value={searchField.searchIn}
          onChange={handleChange}
          className="overlay-select"
        >
          <option value="tok">Token</option>
          <option value="root">Root</option>
        </select>
      </div>
    </div>
  );
};

export default React.memo(SearchInputSelect);
