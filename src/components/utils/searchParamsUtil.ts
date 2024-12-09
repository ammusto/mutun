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
    params.set('t', term);
    params.set('in', searchIn);
    params.set('d', String(definite));
    params.set('p', String(proclitic));
  } 
  // Handle advanced search
  else if (config.searchType === 'advanced' && Array.isArray(config.searchFields)) {
    const andFields = config.searchFields.filter(f => f.tabType === 'AND');
    const orFields = config.searchFields.filter(f => f.tabType === 'OR');

    if (andFields.length > 0) {
      const andTerms = andFields.map((f, i) => {
        params.set(`and_${i}_d`, String(f.definite));
        params.set(`and_${i}_p`, String(f.proclitic));
        return `${f.term}:${f.searchIn}`;
      }).join(',');
      params.set('and_terms', andTerms);
    }

    if (orFields.length > 0) {
      const orTerms = orFields.map((f, i) => {
        params.set(`or_${i}_d`, String(f.definite));
        params.set(`or_${i}_p`, String(f.proclitic));
        return `${f.term}:${f.searchIn}`;
      }).join(',');
      params.set('or_terms', orTerms);
    }
  } 
  // Handle proximity search
  else if (config.searchType === 'proximity' && config.searchFields) {
    if ('firstTerm' in config.searchFields && 'secondTerm' in config.searchFields && 'slop' in config.searchFields) {
      const { firstTerm, secondTerm, slop } = config.searchFields;
      params.set('t1', `${firstTerm.term}:${firstTerm.searchIn}`);
      params.set('t2', `${secondTerm.term}:${secondTerm.searchIn}`);
      params.set('t1_d', String(firstTerm.definite));
      params.set('t1_p', String(firstTerm.proclitic));
      params.set('t2_d', String(secondTerm.definite));
      params.set('t2_p', String(secondTerm.proclitic));
      params.set('slop', slop.toString());
    }
  }

  // Set page parameter if it's not the first page
  if (page !== 1) params.set('page', page.toString());

  // Handle text IDs
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
      term: searchParams.get('t') || '',
      searchIn: (searchParams.get('in') || 'tok') as 'tok' | 'root',
      definite: searchParams.get('d') === 'true',
      proclitic: searchParams.get('p') === 'true'
    }];
  } 
  // Parse advanced search
  else if (type === 'advanced') {
    const andTerms = searchParams.get('and_terms')?.split(',').filter(Boolean) || [];
    const orTerms = searchParams.get('or_terms')?.split(',').filter(Boolean) || [];

    config.searchFields = [
      ...andTerms.map(term => {
        const [value, searchIn] = term.split(':');
        const fieldKey = `and_${andTerms.indexOf(term)}`;
        return {
          term: value,
          tabType: 'AND' as const,
          searchIn: (searchIn || 'tok') as 'tok' | 'root',
          definite: searchParams.get(`${fieldKey}_d`) === 'true',
          proclitic: searchParams.get(`${fieldKey}_p`) === 'true'
        };
      }),
      ...orTerms.map(term => {
        const [value, searchIn] = term.split(':');
        const fieldKey = `or_${orTerms.indexOf(term)}`;
        return {
          term: value,
          tabType: 'OR' as const,
          searchIn: (searchIn || 'tok') as 'tok' | 'root',
          definite: searchParams.get(`${fieldKey}_d`) === 'true',
          proclitic: searchParams.get(`${fieldKey}_pr`) === 'true'
        };
      })
    ];
  } 
  // Parse proximity search
  else if (type === 'proximity') {
    const [term1, searchIn1] = (searchParams.get('t1') || ':').split(':');
    const [term2, searchIn2] = (searchParams.get('t2') || ':').split(':');
    config.searchFields = {
      firstTerm: {
        term: term1 || '',
        searchIn: (searchIn1 || 'tok') as 'tok' | 'root',
        definite: searchParams.get('t1_d') === 'true',
        proclitic: searchParams.get('t1_p') === 'true'
      },
      secondTerm: {
        term: term2 || '',
        searchIn: (searchIn2 || 'tok') as 'tok' | 'root',
        definite: searchParams.get('t2_d') === 'true',
        proclitic: searchParams.get('t2_p') === 'true'
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

