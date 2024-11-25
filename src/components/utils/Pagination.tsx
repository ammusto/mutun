import React, { useEffect } from 'react';
import { PaginationProps } from '../../types';
import './Pagination.css';

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  enableKeyboardNav = true,
  maxResults 
}) => {
  const adjustedTotalItems = maxResults ? Math.min(totalItems, maxResults) : totalItems;
  const pageCount = Math.ceil(adjustedTotalItems / itemsPerPage);
  const maxVisibleButtons = 3;
  const maxPage = maxResults ? Math.ceil(maxResults / itemsPerPage) : pageCount;

  useEffect(() => {
    if (!enableKeyboardNav || pageCount <= 1) return; 

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentPage > 1) {
        onPageChange(currentPage - 1);
      }
      if (event.key === 'ArrowRight' && currentPage < maxPage) {
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, pageCount, maxPage, onPageChange, enableKeyboardNav]);

  if (pageCount <= 1) return null;

  let startPage: number;
  let endPage: number;

  if (pageCount <= maxVisibleButtons) {
    startPage = 1;
    endPage = pageCount;
  } else {
    if (currentPage <= Math.floor(maxVisibleButtons / 2) + 1) {
      startPage = 1;
      endPage = maxVisibleButtons;
    } else if (currentPage + Math.floor(maxVisibleButtons / 2) >= maxPage) {
      startPage = maxPage - maxVisibleButtons + 1;
      endPage = maxPage;
    } else {
      startPage = currentPage - Math.floor(maxVisibleButtons / 2);
      endPage = currentPage + Math.floor(maxVisibleButtons / 2);
    }
  }

  const pageButtons = [];
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        disabled={i === currentPage}
        className={i === currentPage ? 'active' : ''}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="pagination flex">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </button>
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span>...</span>}
        </>
      )}
      {pageButtons}
      {endPage < maxPage && (
        <>
          {endPage < maxPage - 1 && <span>...</span>}
          <button onClick={() => onPageChange(maxPage)}>{maxPage}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === maxPage}
      >
        →
      </button>
    </div>
  );
};

export default React.memo(Pagination);