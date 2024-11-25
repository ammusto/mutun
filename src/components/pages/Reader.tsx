import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { fetchPages } from '../services/pageService';
import { useMetadata } from '../contexts/metadataContext';
import LoadingGif from '../utils/LoadingGif';

const Reader: React.FC = () => {
  const { textId, vol, pageNum } = useParams<{ textId: string; vol: string; pageNum: string }>();
  const validPageNum = pageNum ? parseInt(pageNum, 10) : 1;
  const validVol = vol ? vol : '1';

  if (!textId) {
    throw new Error('textId is required');
  }

  const location = useLocation();
  const { metadata } = useMetadata();
  const [pages, setPages] = useState<{ [key: number]: { text: string; id: number; vol: number } }>({});
  const [currentPageNum, setCurrentPageNum] = useState<number>(validPageNum);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPagesInBook, setTotalPagesInBook] = useState<number>(0);

  const highlightTerms = useMemo(() => {
    const terms = new URLSearchParams(location.search).get('highlight');
    return terms ? terms.split('|').filter(Boolean) : [];
  }, [location.search]);

  const bookTitle = useMemo(() =>
    metadata?.texts.find(text => text.id === parseInt(textId, 10))?.title_ar || 'Unknown Title',
    [metadata, textId]
  );

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchPages(textId, validVol, currentPageNum);
      setPages(prev => ({ ...prev, ...result.pages }));
      setTotalPagesInBook(result.totalPagesInBook);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [textId, validVol, currentPageNum]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handlePageChange = useCallback((newPageNum: number) => {
    setCurrentPageNum(newPageNum);
    if (!pages[newPageNum - 2] || !pages[newPageNum + 2]) {
      loadPages();
    }
  }, [pages, loadPages]);

  const highlightText = useCallback((text: string) => {
    if (!highlightTerms.length || !text) return text;
    let highlightedText = text;
    highlightTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
    });
    return highlightedText;
  }, [highlightTerms]);

  const renderPageContent = useMemo(() => {
    const content = pages[currentPageNum]?.text || '';
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      const highlightedParagraph = highlightText(paragraph);
      return (
        <p
          key={index}
          dangerouslySetInnerHTML={{ __html: highlightedParagraph }}
        />
      );
    });
  }, [pages, currentPageNum, highlightText]);

  if (isLoading && Object.keys(pages).length === 0) {
    return <LoadingGif />;
  }

  return (
    <div className='container'>
      <div className="reader">
        <h1>{bookTitle}</h1>
        <div className="page-content">
          {renderPageContent}
          <div className="page-info">
            Volume {validVol}, Page {currentPageNum}
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPageNum - 1)}
              disabled={currentPageNum <= 1}
            >
              Previous
            </button>
            <span>{currentPageNum} / {totalPagesInBook}</span>
            <button
              onClick={() => handlePageChange(currentPageNum + 1)}
              disabled={currentPageNum >= totalPagesInBook}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reader;
