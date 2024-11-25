import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMetadata } from '../contexts/metadataContext';
import Pagination from '../utils/Pagination';
import './Metadata.css';
import { Text, MetadataContextValue } from '../../types'; // Adjust according to your file structure

const MetadataBrowser: React.FC = () => {
  const { metadata, isLoading }: MetadataContextValue = useMetadata();
  const [texts, setTexts] = useState<Text[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Text>('uri'); // Ensure sortColumn is a valid key of Text
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (metadata && metadata.texts) {
      setTexts(metadata.texts);
    }
  }, [metadata]);

  const filteredTexts = texts.filter((text) =>
    searchTerm === '' ||
    Object.entries(text).some(([key, value]) => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const sortedTexts = [...filteredTexts].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    // Handle null or undefined values for 'date' and 'length' columns
    if (sortColumn === 'date' || sortColumn === 'length') {
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortDirection === 'asc' ? 1 : -1;
      if (valueB == null) return sortDirection === 'asc' ? -1 : 1;

      // Type assertion as we've handled null checks
      return sortDirection === 'asc' ? (valueA as number) - (valueB as number) : (valueB as number) - (valueA as number);
    }

    // Default string sorting, checking for null or undefined values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortDirection === 'asc' ? 1 : -1;
    if (valueB == null) return sortDirection === 'asc' ? -1 : 1;

    // Normal string comparison
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTexts.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (column: keyof Text) => {  // Now column is strictly a keyof Text
    const newDirection = column === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="main">
        <div className="text-content">Loading metadata...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="search-form">
        <input
          type="text"
          placeholder="Filter"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-form-input"
        />
      </div>
      <div className="meta-show-items">
        Show
        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        items per page
      </div>

      <table className="metadata-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('title_ar')}>Title⇅</th>
            <th onClick={() => handleSort('author_ar')}>Author⇅</th>
            <th onClick={() => handleSort('date')}>Death⇅</th>
            <th onClick={() => handleSort('length')}>Length⇅</th>
            <th onClick={() => handleSort('tags')}>Tags⇅</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((text) => (
            <tr key={text.id}>
              <td>
                <ul>
                  <li><Link to={`/text/${text.id}`}>{text.title_ar || 'N/A'}</Link></li>
                  <li><Link to={`/text/${text.id}`}>{text.title_lat || 'N/A'}</Link></li>
                </ul>
              </td>
              <td>
                <ul>
                  <li>
                    <Link to={`/author/${text.author_id}`}>{text.author_sh_ar || text.author_ar || 'N/A'}</Link>
                  </li>
                  <li>
                    <Link to={`/author/${text.author_id}`}>{text.author_sh || text.author_lat || 'N/A'}</Link>
                  </li>
                </ul>
              </td>
              <td>{text.date ? text.date.toString() : 'N/A'}</td>
              <td>{text.length ? text.length.toString() : 'N/A'}</td>
              <td>{text.tags.length > 0 ? text.tags.join(', ') : 'N/A'}</td>
              <td>
                <a href={text.uri} target="_blank" rel="noopener noreferrer">💾</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalItems={sortedTexts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MetadataBrowser;
