import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useRef, 
  useMemo 
} from 'react';
import { loadMetadata } from '../utils/metadataLoader';

import type { 
  MetadataContextValue, 
  Text, 
  Author, 
  DateRange,
  MetadataResponse
} from '../../types';

interface MetadataProviderProps {
  children: React.ReactNode;
}

interface UseTextResult {
  text: Text | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthorResult {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
}

// Create the context
const MetadataContext = createContext<MetadataContextValue | undefined>(undefined);

export const MetadataProvider: React.FC<MetadataProviderProps> = ({ children }) => {
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeCache, setDateRangeCache] = useState<DateRange | null>(null);
  const [sortedTextsCache, setSortedTextsCache] = useState<Text[]>([]);

  // Use a ref to ensure that fetchMetadata is only called once
  const hasFetched = useRef<boolean>(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        // Fetch new data
        const data = await loadMetadata();
        setMetadata(data);

        // Calculate date range from valid dates
        const dates = data.texts
          .map(text => text.date)
          .filter((date): date is number => date !== null && !isNaN(date));

        const dateRange: DateRange = {
          min: dates.length > 0 ? Math.min(...dates) : 0,
          max: dates.length > 0 ? Math.max(...dates) : 2000,
          current: [
            dates.length > 0 ? Math.min(...dates) : 0,
            dates.length > 0 ? Math.max(...dates) : 2000
          ]
        };
        setDateRangeCache(dateRange);

        // Create sorted texts cache
        const sorted = [...data.texts].sort((a, b) => {
          const dateA = a.date || 0;
          const dateB = b.date || 0;
          return dateA - dateB;
        });
        setSortedTextsCache(sorted);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error loading metadata';
        console.error("Error fetching metadata:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const value = useMemo(() => ({
    metadata,
    isLoading,
    error,
    dateRangeCache,
    sortedTextsCache
  }), [metadata, isLoading, error, dateRangeCache, sortedTextsCache]);

  return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
};

export const useMetadata = (): MetadataContextValue => {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};

export const useText = (textId: string | number): UseTextResult => {
  const { metadata, isLoading, error } = useMetadata();
  const parsedTextId = typeof textId === 'string' ? parseInt(textId, 10) : textId;
  
  const text = useMemo(() => 
    metadata?.texts.find(text => parseInt(String(text.id), 10) === parsedTextId) || null,
    [metadata, parsedTextId]
  );

  return { text, isLoading, error };
};

export const useAuthor = (authorId: string | number): UseAuthorResult => {
  const { metadata, isLoading, error } = useMetadata();
  const parsedAuthorId = typeof authorId === 'string' ? parseInt(authorId, 10) : authorId;
  
  const author = useMemo(() => 
    metadata?.authors.find(author => parseInt(String(author.author_id), 10) === parsedAuthorId) || null,
    [metadata, parsedAuthorId]
  );

  return { author, isLoading, error };
};

export const useAuthorTexts = (authorId: string | number): { 
  texts: Text[];
  isLoading: boolean;
  error: string | null;
} => {
  const { metadata, isLoading, error } = useMetadata();
  const parsedAuthorId = typeof authorId === 'string' ? parseInt(authorId, 10) : authorId;
  
  const texts = useMemo(() => 
    metadata?.texts.filter(text => parseInt(String(text.author_id), 10) === parsedAuthorId) || [],
    [metadata, parsedAuthorId]
  );

  return { texts, isLoading, error };
};