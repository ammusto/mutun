import { compressToRanges, decompressRanges, shouldCompress } from './rangeCompression';
import { SearchConfig, SearchType } from '../../types';

interface ParsedSearchParams {
  config: SearchConfig;
  page: number;
  textIds: number[];
}

export const buildSearchParams = (
  config: SearchConfig, 
  selectedTexts: number[], 
  page: number
): URLSearchParams => {
  const params = new URLSearchParams();
  params.set('type', config.searchType as string);

  // Handle simple search
  if (config.searchType === 'simple' && Array.isArray(config.searchFields)) {
    const { term, searchIn, definite, proclitic } = config.searchFields[0];
    params.set('term', term);
    params.set('search_in', searchIn);
    params.set('definite', String(definite));
    params.set('proclitic', String(proclitic));
  } 
  // Handle advanced search
  else if (config.searchType === 'advanced' && Array.isArray(config.searchFields)) {
    const andTerms = config.searchFields
      .filter(f => f.tabType === 'AND')
      .map(f => `${f.term}:${f.searchIn}`)
      .join(',');
    const orTerms = config.searchFields
      .filter(f => f.tabType === 'OR')
      .map(f => `${f.term}:${f.searchIn}`)
      .join(',');
    params.set('and_terms', andTerms);
    params.set('or_terms', orTerms);
  } 
  // Handle proximity search
  else if (config.searchType === 'proximity' && config.searchFields) {
    if ('firstTerm' in config.searchFields && 'secondTerm' in config.searchFields && 'slop' in config.searchFields) {
      const { firstTerm, secondTerm, slop } = config.searchFields;
      params.set('term1', `${firstTerm.term}:${firstTerm.searchIn}`);
      params.set('term2', `${secondTerm.term}:${secondTerm.searchIn}`);
      params.set('slop', slop.toString());
    }
  }

  // Set page parameter if it's not the first page
  if (page !== 1) params.set('page', page.toString());

  // Compress text IDs if needed
  if (selectedTexts.length > 0) {
    if (shouldCompress(selectedTexts)) {
      params.set('text_ids', compressToRanges(selectedTexts));
    } else {
      params.set('text_ids', selectedTexts.join(','));
    }
  }

  return params;
};

export const parseSearchParams = (searchParams: URLSearchParams): ParsedSearchParams => {
  const type = searchParams.get('type') as SearchType;
  let config: SearchConfig = { searchType: type, searchFields: [] };

  // Parse simple search
  if (type === 'simple') {
    config.searchFields = [{
      term: searchParams.get('term') || '',
      searchIn: (searchParams.get('search_in') || 'tok') as 'tok' | 'root',
      definite: searchParams.get('definite') === 'true',
      proclitic: searchParams.get('proclitic') === 'true'
    }];
  } 
  // Parse advanced search
  else if (type === 'advanced') {
    const andTerms = searchParams.get('and_terms')?.split(',').filter(Boolean) || [];
    const orTerms = searchParams.get('or_terms')?.split(',').filter(Boolean) || [];

    config.searchFields = [
      ...andTerms.map(term => {
        const [value, searchIn] = term.split(':');
        return {
          term: value,
          tabType: 'AND' as const,
          searchIn: (searchIn || 'tok') as 'tok' | 'root',
          definite: false,
          proclitic: false
        };
      }),
      ...orTerms.map(term => {
        const [value, searchIn] = term.split(':');
        return {
          term: value,
          tabType: 'OR' as const,
          searchIn: (searchIn || 'tok') as 'tok' | 'root',
          definite: false,
          proclitic: false
        };
      })
    ];
  } 
  // Parse proximity search
  else if (type === 'proximity') {
    const [term1, searchIn1] = (searchParams.get('term1') || ':').split(':');
    const [term2, searchIn2] = (searchParams.get('term2') || ':').split(':');
    config.searchFields = {
      firstTerm: {
        term: term1 || '',
        searchIn: (searchIn1 || 'tok') as 'tok' | 'root',
        definite: false,
        proclitic: false
      },
      secondTerm: {
        term: term2 || '',
        searchIn: (searchIn2 || 'tok') as 'tok' | 'root',
        definite: false,
        proclitic: false
      },
      slop: parseInt(searchParams.get('slop') || '5', 10)
    };
  }

  // Parse text IDs
  const textIdsParam = searchParams.get('text_ids');
  const textIds = textIdsParam ? 
    (textIdsParam.includes('-') ? 
      decompressRanges(textIdsParam) : 
      textIdsParam.split(',').map(Number)
    ) : [];

  return {
    config,
    page: parseInt(searchParams.get('page') || '1', 10),
    textIds
  };
};
