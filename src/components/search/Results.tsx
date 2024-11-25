import React, { useMemo, useState } from 'react';
import ResultPreview from './ResultPreview';
import Pagination from '../utils/Pagination';
import { useMetadata } from '../contexts/metadataContext';
import { ResultsProps, EnhancedSearchResult, Text } from '../../types';
import './Results.css';


const Results: React.FC<ResultsProps> = React.memo(({
  displayedResults,
  currentPage,
  totalResults,
  totalPages,
  itemsPerPage,
  onPageChange
}) => {
  const { metadata } = useMetadata();
  const [previewLimit, setPreviewLimit] = useState<number>(10);

  const resultsWithMetadata = useMemo((): EnhancedSearchResult[] => {
    if (!metadata?.texts) return displayedResults as EnhancedSearchResult[];

    return displayedResults.map(result => {
      // Create a default Text object for unknown texts
      const defaultText: Text = {
        id: result.text_id,
        title_ar: 'Unknown Title',
        title_lat: '',
        author_id: 0,
        author_lat: '',
        author_ar: '',
        author_sh: '',
        author_sh_ar: '',
        date: null,
        length: null,
        page_count: null,
        collection: '',
        ed_info: '',
        ed_tl: '',
        tags: [],
        uri: ''
      };

      const textMetadata = metadata.texts.find(text =>
        String(text.id) === String(result.text_id)
      ) || defaultText;

      const highlightTerms: string[] = [];
      if (result.highlights) {
        Object.values(result.highlights).forEach(highlights => {
          highlights.forEach(highlight => {
            const regex = /<span class="highlight">(.*?)<\/span>/g;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(highlight)) !== null) {
              highlightTerms.push(match[1]);
            }
          });
        });
      }

      return {
        ...result,
        textMetadata,
        highlightTerms: Array.from(new Set(highlightTerms))
      };
    });
  }, [displayedResults, metadata]);

  const startIndex = totalResults > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  const handlePreviewLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreviewLimit(Number(e.target.value));
  };

  return (
    <div>
      <div className="results-header">
        <div className="flex gap-4 items-center results-split">
          {totalResults > 0 && (
            <p>Showing results {startIndex} - {endIndex} of {totalResults}</p>
          )}
          <div>
            <label htmlFor="previewLimit">Previews per result: </label>
            <select
              id="previewLimit"
              value={previewLimit}
              onChange={handlePreviewLimitChange}
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={-1}>All</option>
            </select>
          </div>
        </div>
      </div>

      <table className='results-table'>
        <thead>
          <tr>
            <th>Page:Volume</th>
            <th>Preview</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {resultsWithMetadata.length > 0 ? (
            resultsWithMetadata.map((result, index) => (
              <tr key={`${result.text_id}-${result.page_id}-${index}`}>
                <td>
                  <a
                    href={`/reader/${result.text_id}/${result.vol}/${result.page_id}?highlight=${encodeURIComponent(result.highlightTerms.join('|'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result.vol}:{result.page_num}
                  </a>
                </td>
                <td>
                  <ResultPreview highlight={result.highlights} previewLimit={previewLimit} />
                </td>
                <td>
                  <a
                    href={`/text/${result.text_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result.textMetadata.title_ar}
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>
                <div className="center">
                  <p>No matching results found.</p>
                  <p>Try adjusting your search terms or filters.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalResults > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalResults}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
});

Results.displayName = 'Results';

export default Results;