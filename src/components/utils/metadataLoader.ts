import * as XLSX from 'xlsx';
import type { Text, Author, MetadataResponse, Option } from '../../types';

interface RawTextData {
  text_id: number;
  title_lat: string;
  title_ar: string;
  au_id: number;
  collection: string;
  ed: string;
  ed_tl: string;
  tags: string;
  text_uri: string;
  tok_len?: number;
  pg_len?: number;
}

interface RawAuthorData {
  au_id: number;
  au_lat: string;
  au_ar: string;
  au_sh_lat: string;
  au_sh_ar: string;
  au_death: string;
  bio?: string;
  cit?: string;
  incrp?: string;
}

const loadXLSX = async (url: string): Promise<any[]> => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet);
  } catch (error) {
    console.error(`Error loading XLSX from ${url}:`, error);
    throw error;
  }
};

export const loadMetadata = async (): Promise<MetadataResponse> => {
  try {
    const [textsData, authorsData] = await Promise.all([
      loadXLSX('/texts.xlsx') as Promise<RawTextData[]>,
      loadXLSX('/authors.xlsx') as Promise<RawAuthorData[]>
    ]);
    
    const processedTexts: Text[] = textsData.map(text => {
      const author = authorsData.find(author => author.au_id === text.au_id);
      if (!author && text.au_id) {
        console.warn(`No author found for text ${text.text_id} (au_id: ${text.au_id})`);
      }
      
      return {
        id: text.text_id,
        title_lat: text.title_lat,
        title_ar: text.title_ar,
        author_id: text.au_id,
        author_lat: author ? author.au_lat : '',
        author_ar: author ? author.au_ar : '',
        author_sh: author ? author.au_sh_lat : '',
        author_sh_ar: author ? author.au_sh_ar : '',
        date: author ? parseInt(author.au_death, 10) : null,
        length: text.tok_len ? parseInt(String(text.tok_len), 10) : null,
        page_count: text.pg_len ? parseInt(String(text.pg_len), 10) : null,
        collection: text.collection,
        ed_info: text.ed,
        ed_tl: text.ed_tl,
        tags: text.tags ? text.tags.split(',').map(tag => tag.trim()) : [],
        uri: text.text_uri
      };
    });

    // Generate author options
    const authorMap = new Map<number, Author>();
    authorsData.forEach(author => {
      if (!authorMap.has(author.au_id)) {
        authorMap.set(author.au_id, {
          author_id: author.au_id,
          author_ar: author.au_ar,
          author_lat: author.au_lat,
          author_sh_ar: author.au_sh_ar,
          author_sh_lat: author.au_sh_lat,
          date: parseInt(author.au_death, 10),
          bio: author.bio,
          cit: author.cit,
          incrp: author.incrp
        });
      }
    });
    const authorOptions = Array.from(authorMap.values());

    // Get unique collections
    const collectionSet = new Set(processedTexts.map(text => text.collection));
    const collectionOptions: Option[] = Array.from(collectionSet)
      .filter(Boolean)
      .map(collection => ({ 
        value: collection, 
        label: collection 
      }));

    // Get unique tags for genre options
    const genreSet = new Set(
      processedTexts.flatMap(text => text.tags)
    );
    const genreOptions: Option[] = Array.from(genreSet)
      .filter(Boolean)
      .map(genre => ({
        value: genre,
        label: genre
      }));

    // Calculate date range
    const dates = processedTexts
      .map(text => text.date)
      .filter((date): date is number => date !== null && !isNaN(date));
    
    const minDate = dates.length > 0 ? Math.min(...dates) : 0;
    const maxDate = dates.length > 0 ? Math.max(...dates) : 2000;

    return {
      texts: processedTexts,
      authors: authorOptions,
      collectionOptions,
      genreOptions,
      dateRange: {
        min: minDate,
        max: maxDate,
        current: [minDate, maxDate]
      }
    };
  } catch (error) {
    console.error("Error loading metadata:", error);
    throw error;
  }
};

// utils/rangeCompression.ts
export const compressToRanges = (ids: number[]): string => {
  if (!Array.isArray(ids) || ids.length === 0) return '';
  
  // Convert to numbers and sort
  const sortedIds = [...ids].map(Number).sort((a, b) => a - b);
  
  const ranges: string[] = [];
  let rangeStart = sortedIds[0];
  let prev = sortedIds[0];

  for (let i = 1; i <= sortedIds.length; i++) {
    const current = sortedIds[i];
    const isLastItem = i === sortedIds.length;

    // If not consecutive or last item
    if (!isLastItem && current !== prev + 1) {
      // Single number
      if (rangeStart === prev) {
        ranges.push(rangeStart.toString());
      } else {
        // Range of numbers
        ranges.push(`${rangeStart}-${prev}`);
      }
      rangeStart = current;
    } else if (isLastItem) {
      // Handle the last item
      if (rangeStart === prev) {
        ranges.push(prev.toString());
      } else {
        ranges.push(`${rangeStart}-${prev}`);
      }
    }
    
    prev = current;
  }

  return ranges.join(',');
};

export const decompressRanges = (rangeString: string): number[] => {
  if (!rangeString) return [];
  
  const ids = new Set<number>();
  
  rangeString.split(',').forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        ids.add(i);
      }
    } else {
      ids.add(Number(part));
    }
  });

  return Array.from(ids).sort((a, b) => a - b);
};

export const shouldCompress = (ids: number[]): boolean => {
  if (!Array.isArray(ids) || ids.length === 0) return false;
  
  const rawLength = ids.join(',').length;
  const compressedLength = compressToRanges(ids).length;
  
  // Add a small bias towards compression
  return compressedLength <= rawLength;
};

export const isValidRangeString = (rangeString: string): boolean => {
  if (!rangeString) return false;
  
  const rangePattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
  return rangePattern.test(rangeString);
};

export const getRangeLength = (rangeString: string): number => {
  if (!rangeString) return 0;
  
  let count = 0;
  rangeString.split(',').forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      count += end - start + 1;
    } else {
      count += 1;
    }
  });
  
  return count;
};