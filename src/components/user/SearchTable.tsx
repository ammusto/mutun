import React, { useState, useMemo } from 'react';
import { SearchQueryLink } from './searchLinkBuilder';
import Pagination from '../utils/Pagination';
import { SearchTableProps } from '../../types';

const ITEMS_PER_PAGE = 20;

const SearchTable: React.FC<SearchTableProps> = ({ 
  data, 
  type,
  parseSearchTerms, 
  formatTerms, 
  onAction,
  actionLabel,
  columns,
  emptyMessage 
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sort data by timestamp in descending order (most recent first)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.last_used || a.created_at).getTime();
      const dateB = new Date(b.timestamp || b.last_used || b.created_at).getTime();
      return dateB - dateA;
    });
  }, [data]);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, endIndex);
  
  return (
    <div className="search-table-container">
      <table className="search-table">
        <thead>
          <tr>
            <th></th>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center">{emptyMessage}</td>
            </tr>
          ) : (
            paginatedData.map((item, index) => {
              const parsedQuery = parseSearchTerms(item.query);
              return (
                <tr key={item.id || index}>
                  <td>
                    <button
                      onClick={() => onAction(item)}
                      className="text-button"
                    >
                      {actionLabel}
                    </button>
                  </td>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.key === 'searchQuery' ? (
                        <div>
                          <SearchQueryLink query={item.query}>
                            {formatTerms(parsedQuery)}
                          </SearchQueryLink>
                        </div>
                      ) : col.render ? (
                        col.render(item)
                      ) : (
                        item[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {data.length > ITEMS_PER_PAGE && (
        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalItems={data.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            enableKeyboardNav={false}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchTable);