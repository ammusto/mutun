import React, { useState, useCallback } from 'react';
import { buildOpenSearchQuery } from '../utils/queryParser';
import { performSearch } from '../services/searchService';
import WaitingOverlay from '../utils/WaitingOverlay';
import { useSearch } from '../contexts/SearchContext';
import * as XLSX from 'xlsx';
import './DownloadButton.css';

const DownloadButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const { totalResults, currentSearchConfig, selectedTexts } = useSearch();

  const cleanupHTMLContent = useCallback((htmlString: string): string => {
    return htmlString
      .replace(/<em>([^<]+)<\/em>/g, '$1')
      .replace(/(\S+?)_([^ ]+)/g, '$1')
      .replace(/(?:[\u0600-\u06FF]\.)|[\w#_%]+|\d+/g, (match) => {
        return match.includes('#') || match.includes('_') || match.includes('.') || match.includes('%') || /\d+/.test(match) ? '' : match;
      })
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const fetchAllResults = useCallback(async () => {
    if (!currentSearchConfig) {
      throw new Error('No search configuration available');
    }

    const query = buildOpenSearchQuery({
      ...currentSearchConfig,
      selectedTexts,
      from: 0,
      size: Math.min(totalResults, 1000),
    });
    query.size = Math.min(totalResults, 1000);

    const results = await performSearch(query);
    return results.results;
  }, [currentSearchConfig, selectedTexts, totalResults]);

  const generateCSV = useCallback((data: any[]) => {
    const rows = data.reduce((acc: string[], result) => {
      if (result.highlights && Object.keys(result.highlights).length > 0) {
        for (const highlights of Object.values(result.highlights)) {
          if (Array.isArray(highlights)) {
            for (const text of highlights) {
              const processedContent = cleanupHTMLContent(text);
              acc.push([result.uri, result.page_num, result.vol, `"${processedContent.replace(/"/g, '""')}"`].join(','));
            }
          }
        }
      }
      return acc;
    }, ['text_uri,page_num,vol,content']);

    return rows.join('\n');
  }, [cleanupHTMLContent]);

  const generateXLSX = useCallback((data: any[]) => {
    const rows = data.flatMap((result) => {
      if (!result.highlights) return [];

      return Object.values(result.highlights).flatMap((highlights: any) => {
        if (!Array.isArray(highlights)) return [];

        return highlights.map((text) => ({
          text_uri: result.uri,
          page_num: result.page_num,
          vol: result.vol,
          content: cleanupHTMLContent(text),
        }));
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Search Results');
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  }, [cleanupHTMLContent]);

  const handleDownload = useCallback(async () => {
    if (!totalResults || totalResults === 0) return;
    setIsDownloading(true);

    try {
      const results = await fetchAllResults();
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const fileName = `search_results_${dateString}`;

      let blob: Blob;
      if (downloadFormat === 'csv') {
        const csv = generateCSV(results);
        blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      } else {
        const xlsx = generateXLSX(results);
        blob = new Blob([xlsx], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading ${downloadFormat.toUpperCase()}:`, error);
    } finally {
      setIsDownloading(false);
    }
  }, [totalResults, fetchAllResults, generateCSV, generateXLSX, downloadFormat]);

  return (
 <div className="download-container center">
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