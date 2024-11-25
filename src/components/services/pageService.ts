import { API_USER, API_PASS, API_URL, INDEX } from '../../config/api';

interface PageContent {
  text: string;
  id: number;
  vol: number;
}

interface Page {
  page_content: string;
  page_num: number;
  vol: string;
  page_id: number;
  text_id: string;
}

interface PagesResponse {
  pages: { [key: string]: PageContent };
  centerPage: number;
  totalPagesInBook: number;
}

interface OpenSearchPageResponse {
  hits: {
    hits: Array<{
      _source: Page;
    }>;
    total: {
      value: number;
    };
  };
}

export const fetchPages = async (
  textId: string | number, 
  vol: string | number, 
  pageId: string | number
): Promise<PagesResponse> => {
  try {
    const range = 10; // Fetch 10 pages before and after
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(`${API_USER}:${API_PASS}`)}`
    };

    const query = {
      size: 21,
      sort: [
        { "page_num": "asc" }
      ],
      query: {
        bool: {
          must: [
            { term: { "text_id": textId } },
            { term: { "vol": vol } }
          ],
          should: [
            {
              range: {
                "page_id": {
                  gte: Math.max(1, parseInt(String(pageId)) - range),
                  lte: parseInt(String(pageId)) + range
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      }
    };

    const response = await fetch(`${API_URL}/${INDEX}/_search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OpenSearchPageResponse = await response.json();
    
    // Transform into an object with page_id as keys
    const pages: { [key: string]: PageContent } = {};
    data.hits.hits.forEach(hit => {
      pages[hit._source.page_id] = {
        text: hit._source.page_content,
        id: hit._source.page_num,
        vol: parseInt(String(hit._source.vol))
      };
    });

    return {
      pages,
      centerPage: parseInt(String(pageId)),
      totalPagesInBook: data.hits.total.value
    };
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

// Add this type to your types/index.ts file if not already present
export interface SearchQuery {
  from?: number;
  size?: number;
  track_total_hits?: boolean;
  _source?: string[];
  query: {
    bool: {
      must: any[];
      should: any[];
      filter: any[];
    };
  };
  sort?: any[];
  highlight?: {
    type?: string;
    pre_tags?: string[];
    post_tags?: string[];
    fields: {
      [key: string]: any;
    };
  };
}