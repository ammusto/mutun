import { API_USER, API_PASS, API_URL } from '../../config/api';
import { compressToRanges, decompressRanges } from '../utils/rangeCompression';
import type { SearchQuery, SearchType, Collection, SearchInType, UserDataResponse, SearchData, CorpusData } from '../../types';

const USER_INDEX = 'users';

// Utility function to ensure array of numbers
const ensureNumberArray = (arr: (string | number)[]): number[] => {
  return arr.map(item => typeof item === 'string' ? parseInt(item, 10) : item);
};

function parseQueryObject(queryUrl: string): SearchQuery {
  const params = new URLSearchParams(queryUrl);
  const queryObject: SearchQuery = {
    type: 'simple',
  };

  for (const [key, value] of Array.from(params.entries())) {
    switch (key) {
      case 'type':
        queryObject.type = value as SearchType;
        break;
      case 'term':
      case 'and_terms':
      case 'or_terms':
      case 'term1':
      case 'term2':
        queryObject[key] = value;
        break;
      case 'search_in':
        queryObject.search_in = value as SearchInType;
        break;
      case 'definite':
      case 'proclitic':
        queryObject[key] = value === 'true';
        break;
      case 'slop':
        queryObject.slop = Number(value);
        break;
      case 'text_ids':
        queryObject.text_ids = value.includes('-') ? 
          decompressRanges(value) : 
          value.split(',').map(Number);
        break;
    }
  }

  return queryObject;
}

class UserDataServiceClass {
  private readonly headers: HeadersInit;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${API_USER}:${API_PASS}`)}`
    };
  }

  async getUserData(auth0UserId: string): Promise<UserDataResponse> {
    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_doc/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'GET',
        headers: this.headers
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  }

  async createUserData(auth0UserId: string, email?: string): Promise<UserDataResponse> {
    const timestamp = new Date().toISOString();
    const userData = {
      email,
      created_at: timestamp,
      updated_at: timestamp,
      saved_corpora: [],
      saved_searches: [],
      search_history: []
    };

    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_doc/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(userData)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create user data');
    }

    return await response.json();
  }

  async saveCorpus(auth0UserId: string, corpusData: CorpusData): Promise<Collection> {
    const timestamp = new Date().toISOString();
    
    const savedCorpus: Collection = {
      id: `corpus_${Date.now()}`,
      name: corpusData.name,
      text_ids: corpusData.texts,
      created_at: timestamp,
      last_used: timestamp,
      value: `user_${Date.now()}`,
      label: corpusData.name,
      isUser: true,
      sortOrder: 1
    };
  
    const script = {
      script: {
        source: `
          if (ctx._source.saved_corpora == null) {
            ctx._source.saved_corpora = [];
          }
          ctx._source.saved_corpora.add(params.corpus);
          ctx._source.updated_at = params.timestamp
        `,
        lang: "painless",
        params: {
          corpus: savedCorpus,
          timestamp
        }
      }
    };
  
    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_update/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(script)
      }
    );
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Save corpus error details:', errorData);
      throw new Error('Failed to save corpus');
    }
  
    return savedCorpus;
  }

  async deleteCorpus(auth0UserId: string, corpusId: string): Promise<void> {
    const timestamp = new Date().toISOString();
  
    const script = {
      script: {
        source: `
          ctx._source.saved_corpora.removeIf(corpus -> corpus.id == params.corpusId);
          ctx._source.updated_at = params.timestamp
        `,
        lang: "painless",
        params: {
          corpusId,
          timestamp
        }
      }
    };
  
    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_update/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(script)
      }
    );
  
    if (!response.ok) {
      throw new Error('Failed to delete corpus');
    }
  }

  async updateCorpus(
    auth0UserId: string, 
    corpusId: string, 
    corpusData: CorpusData
  ): Promise<Collection> {
    const timestamp = new Date().toISOString();
    
    const updatedCorpus: Collection = {
      id: corpusId,
      name: corpusData.name,
      text_ids: corpusData.texts,
      created_at: timestamp,
      last_used: timestamp,
      value: `user_${corpusId}`,
      label: corpusData.name,
      isUser: true,
      sortOrder: 1
    };
  
    const script = {
      script: {
        source: `
          for (int i = 0; i < ctx._source.saved_corpora.length; i++) {
            if (ctx._source.saved_corpora[i].id == params.corpusId) {
              ctx._source.saved_corpora[i] = params.updatedCorpus;
              break;
            }
          }
          ctx._source.updated_at = params.timestamp;
        `,
        lang: "painless",
        params: {
          corpusId,
          updatedCorpus,
          timestamp
        }
      }
    };
  
    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_update/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(script)
      }
    );
  
    if (!response.ok) {
      throw new Error('Failed to update corpus');
    }
  
    return updatedCorpus;
  }

  async addToSearchHistory(
    auth0UserId: string, 
    queryUrl: string, 
    resultsCount: number
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    const queryObject = parseQueryObject(queryUrl);
    
    if (queryObject.text_ids && Array.isArray(queryObject.text_ids) && queryObject.text_ids.length > 0) {
      const numberArray = ensureNumberArray(queryObject.text_ids);
      queryObject.text_ids = compressToRanges(numberArray);
    }
    
    const historyEntry = {
      query: queryObject,
      timestamp,
      results_count: resultsCount
    };
  
    const script = {
      script: {
        source: `
          if (ctx._source.search_history == null) {
            ctx._source.search_history = [];
          }

          boolean isDuplicate = false;
          if (ctx._source.search_history.size() > 0) {
            def lastSearch = ctx._source.search_history.get(ctx._source.search_history.size() - 1);
            
            boolean queryMatches = true;
            for (def key : params.entry.query.keySet()) {
              if (!lastSearch.query.containsKey(key) || 
                  lastSearch.query[key] != params.entry.query[key]) {
                queryMatches = false;
                break;
              }
            }
            isDuplicate = queryMatches;
          }

          if (isDuplicate) {
            ctx._source.search_history.get(ctx._source.search_history.size() - 1).timestamp = params.entry.timestamp;
          } else {
            if (ctx._source.search_history.size() >= 100) {
              ctx._source.search_history.remove(0);
            }
            ctx._source.search_history.add(params.entry);
          }
          
          ctx._source.updated_at = params.timestamp;
        `,
        lang: "painless",
        params: {
          entry: historyEntry,
          timestamp
        }
      }
    };
  
    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_update/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(script)
      }
    );
  
    if (!response.ok) {
      throw new Error('Failed to add search to history');
    }
  
    return historyEntry;
  }

  async saveSearch(auth0UserId: string, searchData: SearchData): Promise<any> {
    const timestamp = new Date().toISOString();
    
    const queryObject = parseQueryObject(searchData.query);
    if (queryObject.text_ids && Array.isArray(queryObject.text_ids) && queryObject.text_ids.length > 0) {
      const numberArray = ensureNumberArray(queryObject.text_ids);
      queryObject.text_ids = compressToRanges(numberArray);
    }

    const savedSearch = {
      id: `search_${Date.now()}`,
      name: searchData.name,
      query: queryObject,
      results_count: searchData.resultsCount,
      created_at: timestamp,
      last_used: timestamp
    };

    const script = {
      script: {
        source: `
          if (ctx._source.saved_searches == null) {
            ctx._source.saved_searches = [];
          }
          ctx._source.saved_searches.add(params.search);
          ctx._source.updated_at = params.timestamp
        `,
        lang: "painless",
        params: {
          search: savedSearch,
          timestamp
        }
      }
    };

    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_update/${encodeURIComponent(auth0UserId)}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(script)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save search');
    }

    return savedSearch;
  }

  async unsaveSearch(auth0UserId: string, searchId: string): Promise<void> {
    const timestamp = new Date().toISOString();

    const script = {
      script: {
        source: `
          ctx._source.saved_searches.removeIf(search -> search.id == params.searchId);
          ctx._source.updated_at = params.timestamp
        `,
        lang: "painless",
        params: {
          searchId,
          timestamp
        }
      }
    };

    const response = await fetch(
      `${API_URL}/${USER_INDEX}/_update/${auth0UserId}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(script)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to unsave search');
    }
  }

  async saveSearchFromHistory(
    auth0UserId: string, 
    historyEntry: { query: SearchQuery; results_count: number }, 
    name: string
  ): Promise<boolean> {
    await this.saveSearch(auth0UserId, {
      name,
      query: JSON.stringify(historyEntry.query),
      resultsCount: historyEntry.results_count
    });

    return true;
  }
}

export const userDataService = new UserDataServiceClass();