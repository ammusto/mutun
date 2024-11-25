import React from 'react';
import { Link } from 'react-router-dom';
import type { SearchQuery, SearchQueryLinkProps } from '../../types';

const normalizeTextIds = (textIds: string | number[] | string[] | undefined): string => {
  if (!textIds) return '';
  
  // If it's already a string, return it
  if (typeof textIds === 'string') return textIds;
  
  // If it's an array, join it
  if (Array.isArray(textIds)) {
    return textIds.join(',');
  }
  
  return '';
};

export const buildSearchUrl = (query: SearchQuery): string => {
  const params = new URLSearchParams();
  params.set('type', query.type.toLowerCase());

  switch (query.type.toLowerCase()) {
    case 'simple':
      if (query.term) params.set('term', query.term);
      if (query.search_in) params.set('search_in', query.search_in);
      if (query.definite !== undefined) params.set('definite', String(query.definite));
      if (query.proclitic !== undefined) params.set('proclitic', String(query.proclitic));
      break;

    case 'advanced': {
      const andTerms = query.and_terms || '';
      const orTerms = query.or_terms || '';
      params.set('and_terms', andTerms);
      params.set('or_terms', orTerms);
      break;
    }

    case 'proximity':
      if (query.term1) params.set('term1', query.term1);
      if (query.term2) params.set('term2', query.term2);
      if (query.slop !== undefined) params.set('slop', query.slop.toString());
      break;
  }

  // Handle text_ids with normalization
  const normalizedTextIds = normalizeTextIds(query.text_ids);
  if (normalizedTextIds) {
    params.set('text_ids', normalizedTextIds);
  }

  return `/search?${params.toString()}`;
};

export const SearchQueryLink: React.FC<SearchQueryLinkProps> = ({ query, children }) => (
  <Link 
    to={buildSearchUrl(query)} 
    className="hover:underline text-blue-600"
  >
    {children}
  </Link>
);