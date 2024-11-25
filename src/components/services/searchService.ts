import { API_USER, API_PASS, API_URL, INDEX } from '../../config/api';
import type { SearchResult } from '../../types';

interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  took: number;
  sortValues?: any[];
}

interface OpenSearchResponse {
  hits: {
    hits: Array<{
      _source: Omit<SearchResult, 'highlights'>;
      _score: number;
      sort?: any[];
      highlight?: {
        [key: string]: string[];
      };
    }>;
    total: {
      value: number;
    };
  };
  took: number;
}

export const performSearch = async (query: any): Promise<SearchResponse> => {
  if (query.from >= 10000) {
    throw new Error('Search results limited to first 10,000 results');
  }
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(`${API_USER}:${API_PASS}`)}`
    };

    const response = await fetch(`${API_URL}/${INDEX}/_search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenSearch error response:', errorText);
      throw new Error(`OpenSearch error: ${response.status} ${response.statusText}`);
    }

    const data: OpenSearchResponse = await response.json();

    // Check if the data contains hits
    if (!data.hits || !data.hits.hits) {
      console.error('Invalid OpenSearch response format:', data);
      return {
        results: [],
        totalResults: 0,
        took: data.took || 0
      };
    }

    return {
      results: data.hits.hits.map(hit => ({
        ...hit._source,
        highlights: hit.highlight || {},
        score: hit._score
      })),
      totalResults: data.hits.total.value || 0,
      took: data.took
    };
  } catch (error) {
    console.error('Search error details:', error);
    throw error;
  }
};