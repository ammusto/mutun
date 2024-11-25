import type { SearchConfig, SearchField, ProximitySearchConfig } from '../../types';

const FRAGMENT_SIZE = 150;
const PHRASE_LIMIT = 150;

interface OpenSearchQuery {
  from: number;
  size: number;
  track_total_hits: boolean;
  _source: string[];
  query: {
    bool: {
      must: any[];
      should: any[];
      filter: any[];
    }
  };
  sort: { [key: string]: { order: string } }[];
  highlight: {
    pre_tags: string[];
    post_tags: string[];
    fields: { [key: string]: any };
  };
}

interface HighlightConfig {
  type: string;
  phrase_limit: number;
  fragment_size: number;
  number_of_fragments: number;
  matched_fields: string[];
  require_field_match: boolean;
  boundary_scanner_locale: string;
  highlight_query?: any;
}



function processRootCharacters(term: string): string {
  const arabicCharsRegex = /[أئؤءيىاو]/g;
  return term.replace(arabicCharsRegex, '#');
}

function addPeriodsToRoot(term: string): string {
  const processedTerm = processRootCharacters(term);
  return processedTerm.split('').join('.') + '.';
}

function formatRootTerm(term: string, isRoot: boolean): string {
  if (!isRoot) return term;
  return addPeriodsToRoot(term);
}

export function buildOpenSearchQuery(
  config: SearchConfig,
  page: number = 1,
  batchSize: number = 20,
  itemsPerPage: number = 20
): OpenSearchQuery {
  // Calculate the starting index based on regular page size
  const startIndex = (page - 1) * itemsPerPage;

  // Initialize base query structure with correct from/size
  const query: OpenSearchQuery = {
    from: startIndex,
    size: batchSize,  // Use batchSize for fetching
    track_total_hits: true,
    _source: ["text_id", "vol", "page_num", "page_id", "uri"],
    query: {
      bool: {
        must: [],
        should: [],
        filter: []
      }
    },
    sort: [{ "uri": { "order": "asc" } }],
    highlight: {
      pre_tags: ['<span class="highlight">'],
      post_tags: ['</span>'],
      fields: {}
    }
  };

  // Add text filtering if specified
  const selectedTexts = config.selectedTexts ?? [];
  if (selectedTexts.length > 0) {
    query.query.bool.filter.push({
      terms: { 'text_id': selectedTexts }
    });
  }

 
  const { searchType, searchFields } = config;

  try {
    switch (searchType) {
      case 'simple':
        if (Array.isArray(searchFields) && searchFields.length > 0) {
          handleSimpleSearch(query, searchFields[0]);
        }
        break;

      case 'advanced':
        if (Array.isArray(searchFields) && searchFields.length > 0) {
          handleAdvancedSearch(query, searchFields);
        }
        break;

        case 'proximity':
          if (searchFields && 'firstTerm' in searchFields && 'secondTerm' in searchFields && 'slop' in searchFields) {
            handleProximitySearch(query, searchFields as ProximitySearchConfig);
          }
        break;

      default:
        throw new Error(`Unsupported search type: ${searchType}`);
    }
    return query;
  } catch (error) {
    console.error('Error building search query:', error);
    throw new Error(`Failed to build search query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getSearchField(definite: boolean, proclitic: boolean): string {
  if (definite && proclitic) return 'page_content.combined';
  if (definite) return 'page_content.definite';
  if (proclitic) return 'page_content.proclitic';
  return 'page_content';
}

function configureHighlight(field: string, query: any, proximity: boolean): HighlightConfig {
  const adjustedFragmentSize = field === 'token_roots' ? FRAGMENT_SIZE * 2 : FRAGMENT_SIZE;

  const config: HighlightConfig = {
    type: proximity ? "plain" : "fvh",
    phrase_limit: PHRASE_LIMIT,
    fragment_size: adjustedFragmentSize,
    number_of_fragments: 100,
    matched_fields: [field],
    require_field_match: true,
    boundary_scanner_locale: 'ar'
  };

  if (query?.wildcard || query?.span_near) {
    config.highlight_query = query;
  }

  return config;
}


function buildTokenQuery(term: string, field: string): any {
  // Check if it's a phrase with spaces
  const terms = term.split(/\s+/);
  
  // If it's a single term (no spaces)
  if (terms.length === 1) {
    const hasWildcard = term.includes('*') || term.includes('?');
    if (hasWildcard) {
      return {
        wildcard: {
          [field]: {
            value: term,
            case_insensitive: true
          }
        }
      };
    } else {
      return {
        match_phrase: {
          [field]: {
            query: term
          }
        }
      };
    }
  }
  
  // If it's a phrase and any term has wildcards
  const hasWildcardTerm = terms.some(t => t.includes('*') || t.includes('?'));
  if (hasWildcardTerm) {
    return {
      span_near: {
        clauses: terms.map(term => {
          const hasWildcard = term.includes('*') || term.includes('?');
          if (hasWildcard) {
            return {
              span_multi: {
                match: {
                  wildcard: {
                    [field]: {
                      value: term,
                      case_insensitive: true
                    }
                  }
                }
              }
            };
          } else {
            return {
              span_term: {
                [field]: term
              }
            };
          }
        }),
        slop: 0,
        in_order: true
      }
    };
  }
  
  return {
    match_phrase: {
      [field]: {
        query: term
      }
    }
  };
}

function handleSimpleSearch(query: OpenSearchQuery, searchField: SearchField): void {
  const { term, searchIn, definite, proclitic } = searchField;

  if (!term) return;

  if (searchIn === 'tok') {
    const field = getSearchField(definite, proclitic);
    const tokenQuery = buildTokenQuery(term, field);
    query.highlight.fields[field] = configureHighlight(field, tokenQuery, true);
    query.query.bool.must.push(tokenQuery);
    console.log(query)

  } else {
    const processedTerm = formatRootTerm(term, true);
    // For root searches, we still use match_phrase since root terms 
    // are processed differently and don't need span queries
    const rootQuery = {
      match_phrase: {
        'token_roots': {
          query: processedTerm,
        }
      }
    };
    query.highlight.fields['token_roots'] = configureHighlight('token_roots', rootQuery, true);
    query.query.bool.must.push(rootQuery);
    console.log(query)
  }
}
function handleAdvancedSearch(query: OpenSearchQuery, searchFields: SearchField[]): void {
  const andFields = searchFields.filter(field => field.tabType === 'AND');
  const orFields = searchFields.filter(field => field.tabType === 'OR');

  andFields.forEach(field => {
    if (!field.term) return;

    if (field.searchIn === 'tok') {
      const searchField = getSearchField(field.definite, field.proclitic);
      const tokenQuery = buildTokenQuery(field.term, searchField);
      query.highlight.fields[searchField] = configureHighlight(searchField, tokenQuery, false);
      query.query.bool.must.push(tokenQuery);
    } else {
      const processedTerm = formatRootTerm(field.term, true);
      const rootQuery = {
        wildcard: {
          'token_roots': {
            value: processedTerm,
            case_insensitive: true
          }
        }
      };
      query.highlight.fields['token_roots'] = configureHighlight('token_roots', rootQuery, false);
      query.query.bool.must.push(rootQuery);
    }
  });

  if (orFields.length > 0) {
    const shouldClauses = orFields.map(field => {
      if (!field.term) return null;

      if (field.searchIn === 'tok') {
        const searchField = getSearchField(field.definite, field.proclitic);
        const tokenQuery = buildTokenQuery(field.term, searchField);
        query.highlight.fields[searchField] = configureHighlight(searchField, tokenQuery, false);
        return tokenQuery;
      } else {
        const processedTerm = formatRootTerm(field.term, true);
        const rootQuery = {
          wildcard: {
            'token_roots': {
              value: processedTerm,
              case_insensitive: true
            }
          }
        };
        query.highlight.fields['token_roots'] = configureHighlight('token_roots', rootQuery, false);
        return rootQuery;
      }
    }).filter(Boolean);

    if (shouldClauses.length > 0) {
      query.query.bool.must.push({
        bool: {
          should: shouldClauses,
          minimum_should_match: 1
        }
      });
    }
  }
}

function handleProximitySearch(query: OpenSearchQuery, searchFields: ProximitySearchConfig): void {
  const { firstTerm, secondTerm, slop } = searchFields;
  const isFirstRoot = firstTerm.searchIn === 'root';
  const isSecondRoot = secondTerm.searchIn === 'root';
  
  if (isFirstRoot || isSecondRoot) {
    const processedFirstTerm = formatRootTerm(firstTerm.term, isFirstRoot);
    const processedSecondTerm = formatRootTerm(secondTerm.term, isSecondRoot);

    const rootQuery = {
      span_near: {
        clauses: [
          {
            span_multi: {
              match: {
                wildcard: {
                  'token_roots': {
                    value: processedFirstTerm,
                    case_insensitive: true
                  }
                }
              }
            }
          },
          {
            span_multi: {
              match: {
                wildcard: {
                  'token_roots': {
                    value: processedSecondTerm,
                    case_insensitive: true
                  }
                }
              }
            }
          }
        ],
        slop: slop,
        in_order: false
      }
    };
    query.highlight.fields['token_roots'] = configureHighlight('token_roots', rootQuery, true);
    query.query.bool.must.push(rootQuery);
  } else {
    const searchField = getSearchField(firstTerm.definite, firstTerm.proclitic);
    const firstHasWildcard = firstTerm.term.includes('*') || firstTerm.term.includes('?');
    const secondHasWildcard = secondTerm.term.includes('*') || secondTerm.term.includes('?');

    // Create span clauses based on whether terms contain wildcards
    const spanClauses = [];
    
    // Handle first term
    if (firstHasWildcard) {
      spanClauses.push({
        span_multi: {
          match: {
            wildcard: {
              [searchField]: {
                value: firstTerm.term,
                case_insensitive: true
              }
            }
          }
        }
      });
    } else {
      spanClauses.push({
        span_term: {
          [searchField]: firstTerm.term
        }
      });
    }
    
    if (secondHasWildcard) {
      spanClauses.push({
        span_multi: {
          match: {
            wildcard: {
              [searchField]: {
                value: secondTerm.term,
                case_insensitive: true
              }
            }
          }
        }
      });
    } else {
      spanClauses.push({
        span_term: {
          [searchField]: secondTerm.term
        }
      });
    }

    const spanQuery = {
      span_near: {
        clauses: spanClauses,
        slop: slop,
        in_order: false
      }
    };
    
    query.highlight.fields[searchField] = configureHighlight(searchField, spanQuery, true);
    query.query.bool.must.push(spanQuery);
  }
}