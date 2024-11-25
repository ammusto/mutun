import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import WaitingOverlay from '../utils/WaitingOverlay';
import { performSearch } from '../services/searchService';
import { useSearch } from '../contexts/SearchContext';
import { SearchResult, SearchConfig } from '../../types';
import './DownloadButton.css';

const DownloadButton: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'xlsx'>('csv');
  const { totalResults, currentSearchConfig } = useSearch();


  const processHTMLContent = useCallback((htmlString: string): string => {
    const emTaggedString = htmlString
      .replace(/<span class="highlight">/g, '<em>')
      .replace(/<\/span>/g, '</em>');
  
    return emTaggedString
      .replace(/(\S+?)_(<em>([^<]+)<\/em>|[^ ]+)/g, (match, token, rootPart) => {
        if (rootPart.includes('<em>')) {
          return rootPart.replace(/<em>([^<]+)<\/em>/, `<em>${token}</em>`);
        } else {
          return token;
        }
      })
      .replace(/(?:[\u0600-\u06FF]\.)|[\w#_%]+|\d+/g, (match) => {
        return match.includes('#') || match.includes('_') || match.includes('.') || match.includes('%') || /\d+/.test(match) ? '' : match;
      })
      .replace(/\s+/g, ' ').trim();
  }, []);

  const handleDownload = useCallback(async () => {
    if (!totalResults || totalResults === 0) {
      console.error('No results available for download');
      return;
    }
    setIsDownloading(true);
  
    const fetchAllResults = async (): Promise<SearchResult[]> => {
      const maxResults = 1000;
      const modifiedQuery: SearchConfig = {
        ...currentSearchConfig,
        from: 0,
        size: maxResults,
        highlight: {
          pre_tags: ['<em>'],
          post_tags: ['</em>'],
        },
      };
      console.log(modifiedQuery)
  
      const results = await performSearch(modifiedQuery);
      return results.results;
    };
  
    const generateCSV = (data: SearchResult[]): string => {
      const fields = ['text_uri', 'page_num', 'vol', 'page_content', 'highlighted_text'];
      const rows = data.reduce((acc, result) => {
        if (result.highlights && Object.keys(result.highlights).length > 0) {
          Object.keys(result.highlights).forEach(key => {
            const highlightArray = result.highlights?.[key];
            if (Array.isArray(highlightArray)) {
              highlightArray.forEach(highlightedText => {
                const processedContent = processHTMLContent(highlightedText);
                acc.push([
                  result.uri,
                  result.page_num,
                  result.vol,
                  `"${processedContent.replace(/"/g, '""')}"`,
                ].join(','));
              });
            }
          });
        }
        return acc;
      }, [] as string[]);
    
      return [fields.join(','), ...rows].join('\n');
    };
  
    const generateXLSX = (data: SearchResult[]): ArrayBuffer => {
      const rows = data.flatMap(result => {
        if (result.highlights && Object.keys(result.highlights).length > 0) {
          return Object.keys(result.highlights).flatMap(key => {
            const highlightArray = result.highlights?.[key];
            if (Array.isArray(highlightArray)) {
              return highlightArray.map(highlightedText => ({
                text_uri: result.uri,
                page_num: result.page_num,
                vol: result.vol,
                highlighted_text: processHTMLContent(highlightedText),
              }));
            }
            return [];
          });
        }
        return [];
      });
    
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Results');
    
      return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    };
  
    try {
      const allResults = await fetchAllResults();
      const now = new Date();
      const dateString = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear().toString().slice(-2)}`;
      let output: string | ArrayBuffer | null = null;
      let contentType: string | null = null;
      let fileName: string | null = null;
  
      if (downloadFormat === 'csv') {
        output = generateCSV(allResults);
        contentType = 'text/csv';
        fileName = `search_results_${dateString}.csv`;
      } else if (downloadFormat === 'xlsx') {
        output = generateXLSX(allResults);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `search_results_${currentSearchConfig?.searchType || 'query'}_${dateString}.xlsx`;
      }
  
      if (output !== null && contentType !== null && fileName !== null) {
        const blob = new Blob([output], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Error downloading ${downloadFormat.toUpperCase()}:`, error);
    } finally {
      setIsDownloading(false);
    }
  }, [totalResults, currentSearchConfig, downloadFormat, processHTMLContent]);

  return (
    <div className="download-container">
      <button
        onClick={handleDownload}
        className="download-button"
        disabled={isDownloading || !totalResults || totalResults === 0}
      >
        {isDownloading
          ? 'Preparing Download...'
          : `Download ${totalResults > 1000 ? '1,000' : totalResults.toLocaleString()} Results as ${downloadFormat.toUpperCase()}`}
      </button>
      <select
        value={downloadFormat}
        onChange={(e) => setDownloadFormat(e.target.value as 'csv' | 'xlsx')}
        className="download-format-select"
        disabled={isDownloading}
      >
        <option value="xlsx">XLSX</option>
        <option value="csv">CSV</option>
      </select>
      <WaitingOverlay isVisible={isDownloading} />
    </div>
  );
};

export default React.memo(DownloadButton);