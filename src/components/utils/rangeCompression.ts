/**
 * Utilities for compressing and decompressing arrays of text IDs using range notation
 */

/**
 * Compresses an array of numbers into a range string notation
 * @param ids Array of numbers to compress
 * @returns Compressed range string
 */
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

/**
 * Decompresses a range string into an array of numbers
 * @param rangeString Compressed range string to decompress
 * @returns Array of numbers
 */
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

/**
 * Determines if compression would be beneficial
 * @param ids Array of numbers to evaluate
 * @returns Boolean indicating if compression would be beneficial
 */
export const shouldCompress = (ids: number[]): boolean => {
  if (!Array.isArray(ids) || ids.length === 0) return false;
  
  const rawLength = ids.join(',').length;
  const compressedLength = compressToRanges(ids).length;
  
  // Add a small bias towards compression
  return compressedLength <= rawLength;
};

/**
 * Validates a range string format
 * @param rangeString String to validate
 * @returns Boolean indicating if string is valid
 */
export const isValidRangeString = (rangeString: string): boolean => {
  if (!rangeString) return false;
  
  const rangePattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
  return rangePattern.test(rangeString);
};

/**
 * Calculates the total number of items in a range string
 * @param rangeString Range string to evaluate
 * @returns Total number of items represented by the range
 */
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