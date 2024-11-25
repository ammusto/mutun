import { loadMetadata } from '../components/utils/metadataLoader';
import type { Text, Option, DateRange, ProcessedText } from '../types';

interface SearchLoaderResult {
  processedTexts: ProcessedText[];
  genreOptions: Option[];
  collectionOptions: Option[];
  dateRange: DateRange;
}

export async function searchLoader(): Promise<SearchLoaderResult> {
  // Load metadata from cache or fetch
  const metadata = await loadMetadata();
  
  // Pre-process the texts list
  const processedTexts: ProcessedText[] = metadata.texts.map(text => ({
    id: text.id,
    title_ar: text.title_ar,
    title_lat: text.title_lat,
    author_ar: text.author_ar,
    author_lat: text.author_lat,
    date: text.date,
    tags: text.tags,
    collection: text.collection
  }));

  // Pre-sort texts by date
  const sortedTexts = [...processedTexts].sort((a, b) => {
    const dateA = a.date || 0;
    const dateB = b.date || 0;
    return dateA - dateB;
  });

  return {
    processedTexts: sortedTexts,
    genreOptions: metadata.genreOptions,
    collectionOptions: metadata.collectionOptions,
    dateRange: metadata.dateRange
  };
}