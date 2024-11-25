// Basic entity types
export interface Text {
  id: number;
  title_ar: string;
  title_lat: string;
  author_id: number;
  author_lat: string;
  author_ar: string;
  author_sh: string;
  author_sh_ar: string;
  date: number | null;
  length: number | null;
  page_count: number | null;
  collection: string;
  ed_info: string;
  ed_tl: string;
  tags: string[];
  uri: string;
}

export interface Author {
  author_id: number;
  author_ar: string;
  author_lat: string;
  author_sh_ar: string;
  author_sh_lat: string;
  date: number;
  bio?: string;
  cit?: string;
  incrp?: string;
}

// Search related types

export type SearchType = 'simple' | 'advanced' | 'proximity';
export type SearchInType = 'tok' | 'root';

export interface SearchFormContextType {
  searchFormState: SearchFormState;
  handleSimpleFieldChange: (name: string, value: string | boolean) => void;
  handleAdvancedFieldChange: (index: number, name: string, value: string | boolean, type: 'AND' | 'OR') => void;
  handleProximityFieldChange: (index: number, name: string, value: string | boolean) => void;
  handleSlopChange: (value: number) => void;
  setSearchType: (type: SearchType) => void;
  addAdvancedField: (type: 'AND' | 'OR') => void;
  removeAdvancedField: (index: number, type: 'AND' | 'OR') => void;
  resetSearchForm: () => void;
}



export interface SearchFormState {
  searchType: SearchType;
  simple: SearchField;
  advanced: {
    andFields: SearchField[];
    orFields: SearchField[];
  };
  proximity: {
    firstTerm: SearchField;
    secondTerm: SearchField;
    slop: number;
  };
}

export interface SelectedText {
  id: string;
  title: string;
  author: string;
  date: number | null;
}

export interface SearchField {
  term: string;
  searchIn: SearchInType;
  definite: boolean;
  proclitic: boolean;
  tabType?: 'AND' | 'OR';
}

export interface ProximitySearchProps {
  proximityData: ProximitySearchConfig;
  handleFieldChange: (index: number, name: string, value: string | boolean, isFirstTerm: boolean) => void;
  handleSlopChange: (value: number) => void;
}

export interface ProximitySearchConfig extends SearchConfig {
  firstTerm: SearchField;
  secondTerm: SearchField;
  slop: number;
}


export interface SearchConfig {
  searchType?: 'simple' | 'advanced' | 'proximity' | undefined;
  searchFields?: SearchField[] | ProximitySearchConfig | undefined;
  selectedTexts?: number[];
  query?: string;
  size?: number;
  highlight?: {
    pre_tags?: string[];
    post_tags?: string[];
  };
  from?: number;
}


export interface SearchInputSelectProps {
  index: number;
  searchField: SearchField;
  handleFieldChange: (index: number, name: string, value: string | boolean, searchType: string) => void;
  searchType: string;
}


export interface SearchConfigExtended extends SearchConfig {
  from?: number;
  size?: number;
  highlight?: {
    pre_tags?: string[];
    post_tags?: string[];
  };
  query?: string;
}

export interface SearchResult {
  text_id: number;
  vol: number;
  page_num: number;
  page_id: number;
  uri: string;
  highlights?: {
    [key: string]: string[];
  };
  textMetadata?: Text;
  highlightTerms?: string[];
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  created_at: string;
  last_used: string;
  value: string;
  label: string;
  isUser: boolean;
  sortOrder: number;
  text_ids: number[];
  collectionName?: string;
}

// User related types
export interface UserDataSource {
  email: string;
  created_at: string;
  updated_at: string;
  saved_corpora: Collection[];
  saved_searches: SavedSearch[];
  search_history: SearchHistory[];
}

export interface UserData {
  _id: string;
  _source: UserDataSource;
}

export interface SearchHistoryProps {
  searchHistory: SearchHistoryItem[];
  savedSearches: SavedSearchItem[];
  onUpdate: () => void;
}

export interface SearchHistoryItem {
  query: SearchQuery;
  timestamp: string;
  results_count: number;
}

export interface SavedSearchItem extends SearchHistoryItem {
  id: string;
  name: string;
}


export interface SearchTableProps {
  data: any[];
  type: string;
  parseSearchTerms: (query: SearchQuery) => any;
  formatTerms: (parsedQuery: any) => string;
  onAction: (item: any) => void;
  actionLabel: string;
  columns: Array<{
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
  }>;
  emptyMessage: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  results_count: number;
  created_at: string;
  last_used: string;
  timestamp: string;
}

export interface SearchHistory {
  query: SearchQuery;
  timestamp: string;
  results_count: number;
}

export interface SearchQueryLinkProps {
  query: SearchQuery;
  children: React.ReactNode;
}

export interface SearchQuery {
  type: string;
  term?: string;
  search_in?: string;
  definite?: boolean;
  proclitic?: boolean;
  and_terms?: string;
  or_terms?: string;
  term1?: string;
  term2?: string;
  slop?: number;
  text_ids?: number[] | string | string[];
}

export interface AdvancedSearchProps {
  andFields: SearchField[];
  orFields: SearchField[];
  handleFieldChange: (index: number, name: string, value: string | boolean, type: 'AND' | 'OR') => void;
  addAdvancedField: (type: 'AND' | 'OR') => void;
  removeAdvancedField: (index: number, type: 'AND' | 'OR') => void;
}

export interface SimpleSearchProps {
  searchField: SearchField;
  handleFieldChange: (name: string, value: string | boolean) => void;
}

export interface ProcessedText {
  id: number;
  title_ar: string;
  title_lat: string;
  author_ar: string;
  author_lat: string;
  date: number | null;
  tags: string[];
  collection: string;
}

// Metadata related types

export interface MetadataResponse {
  texts: Text[];
  authors: Author[];
  collectionOptions: Option[];
  genreOptions: Option[];
  dateRange: DateRange;
}

export interface Text {
  id: number;
  title_ar: string;
  title_lat: string;
  author_id: number;
  author_lat: string;
  author_ar: string;
  author_sh: string;
  author_sh_ar: string;
  date: number | null;
  length: number | null;
  page_count: number | null;
  collection: string;
  ed_info: string;
  ed_tl: string;
  tags: string[];
  uri: string;
}

export interface Author {
  author_id: number;
  author_ar: string;
  author_lat: string;
  author_sh_ar: string;
  author_sh_lat: string;
  date: number;
  bio?: string;
  cit?: string;
  incrp?: string;
}

export interface DateRange {
  min: number;
  max: number;
  current: [number, number];
}

export interface Option {
  value: string;
  label: string;
}

export interface MetadataContextValue {
  metadata: MetadataResponse | null;
  isLoading: boolean;
  error: string | null;
  dateRangeCache: DateRange | null;
  sortedTextsCache: Text[];
}

export interface MetadataProviderProps {
  children: React.ReactNode;
}

export interface UseTextResult {
  text: Text | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthorResult {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
}
export interface TextDetail {
  id: number;
  title: string;
  author: string;
  author_long: string;
  date: number | null;
}

// Component Props types
export interface SearchFormProps {
  onSearch: (config: SearchConfig, selectedTexts: number[]) => void;
  onResetSearch: () => void;
  initialQuery?: string;
  initialTextIds?: number[];
  searchConfig: SearchConfig;
  setSearchConfig: React.Dispatch<React.SetStateAction<SearchConfig>>;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ResultsProps {
  displayedResults: SearchResult[];
  currentPage: number;
  totalResults: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
}

export interface TextFilterListProps {
  disabledTexts: number[];
  onResetSelection: () => void;
}

export interface EnhancedSearchResult extends SearchResult {
  textMetadata: Text | {
    id: number;
    title_ar: string;
    title_lat: string;
    author_id: number;
    author_lat: string;
    author_ar: string;
    author_sh: string;
    author_sh_ar: string;
    date: number | null;
    length: number | null;
    page_count: number | null;
    collection: string;
    ed_info: string;
    ed_tl: string;
    tags: string[];
    uri: string;
  };
  highlightTerms: string[];
}


export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  enableKeyboardNav?: boolean;
  maxResults?: number;
}

export interface SearchContextValue {
  metadata: MetadataResponse | null;
  filteredTexts: Text[];
  selectedTexts: number[];
  selectedTextDetails: TextDetail[];
  textFilter: string;
  selectedGenres: string[];
  selectedCollections: string[];
  dateRange: DateRange;
  searchQuery: string;
  displayedResults: SearchResult[];
  totalResults: number;
  currentPage: number;
  isSearching: boolean;
  totalPages: number;
  hasSearched: boolean;
  isChangingPage: boolean;
  highlightQuery: string;
  currentSearchConfig: SearchConfig | null;
  ITEMS_PER_PAGE: number;
  setSearchQuery: (query: string) => void;
  setSelectedTexts: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedTextDetails: React.Dispatch<React.SetStateAction<TextDetail[]>>;
  setTextFilter: (filter: string) => void;
  setSelectedGenres: (genres: string[]) => void;
  setSelectedCollections: (collections: string[]) => void;
  setDateRange: (range: DateRange) => void;
  setHighlightQuery: (query: string) => void;
  handleSearch: (config: SearchConfig, texts: number[], page: number) => Promise<void>;
  handlePageChange: (page: number) => Promise<void>;
  resetSearch: () => void;
  resetSelection: () => void;
  isMetadataLoading: boolean;
}

// Utility types
export interface TEIDownloaderProps {
  textId: string | number;
  titleTl: string;
  linkText: string;
  img?: boolean;
}

export interface LoadingGifProps {
  divs?: boolean;
}

export interface Auth0User {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Auth0Context {
  user: Auth0User | undefined;
  isAuthenticated: boolean;
  loginWithRedirect: (options?: object) => Promise<void>;
  logout: (options?: { logoutParams?: { returnTo?: string } }) => void;
  isLoading: boolean;
  [key: string]: any; 
}

export interface Auth0ProviderWrapperProps {
  children: React.ReactNode;
}

export interface Auth0ContextUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  updated_at?: string;
}


export interface UserDataResponse {
  _id: string;
  _source: {
    email: string;
    created_at: string;
    updated_at: string;
    saved_corpora: Collection[];
    saved_searches: any[];
    search_history: any[];
  };
}

export interface SearchData {
  name: string;
  query: string;
  resultsCount: number;
}

export interface CorpusData {
  name: string;
  texts: number[];
}

type SearchAction = 
  | { type: 'START_SEARCH' }
  | { type: 'SEARCH_SUCCESS'; payload: { 
      results: SearchResult[]; 
      totalResults: number;
      page: number;
      searchConfig: SearchConfig;
    }}
  | { type: 'SEARCH_ERROR' }
  | { type: 'SET_SEARCH_COMPLETE' };

interface SearchState {
  cachedResults: SearchResult[];
  displayedResults: SearchResult[];
  totalResults: number;
  currentPage: number;
  lastFetchedPage: number;
  hasSearched: boolean;
  searchQuery: string;
  highlightQuery: string;
  currentSearchConfig: SearchConfig | null;
  isSearching: boolean;
}