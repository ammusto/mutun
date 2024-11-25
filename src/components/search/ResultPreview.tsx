import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';

interface ResultPreviewProps {
  highlight: {
    [key: string]: string[];
  } | undefined;
  previewLimit: number;
}

const processHTMLContent = (htmlString: string): string => {

  return htmlString
    .replace(/(\S+?)_(<span class="highlight">([^<]+)<\/span>|[^ ]+)/g, (
      match: string,
      token: string,
      rootPart: string,
      rootText?: string
    ) => {
      if (rootPart.includes('<span class="highlight">')) {
        return rootPart.replace(/<span class="highlight">([^<]+)<\/span>/, `<span class="highlight">${token}</span>`);
      } else {
        return token;
      }
    })
    .replace(/(?:[\u0600-\u06FF]\.)|[\w#_%]+|\d+/g, (match: string) => {
      return match.includes('#') || 
             match.includes('_') || 
             match.includes('.') || 
             match.includes('%') || 
             /\d+/.test(match) ? '' : match;
    })    
    .replace(/\s+/g, ' ')
    .trim();
};

const ResultPreview: React.FC<ResultPreviewProps> = ({ highlight, previewLimit }) => {
  const previousHighlight = useRef<typeof highlight>();
  const [highlights, setHighlights] = useState<JSX.Element[]>([]);

  // Memoize the processing of highlights to run only when highlight prop changes
  const processHighlights = useCallback((): JSX.Element[] => {
    if (!highlight) {
      return [<li key="no-preview">No matching preview available.</li>];
    }

    const orderedFields = Object.keys(highlight).sort();
    const allHighlights: JSX.Element[] = [];

    orderedFields.forEach(field => {
      highlight[field].forEach((highlightedText, index) => {
        const processedContent = processHTMLContent(highlightedText);
        // Only add if content is not empty after processing
        if (processedContent.trim()) {
          allHighlights.push(
            <li 
              key={`${field}-${index}-${processedContent.slice(0, 20)}`}
              dangerouslySetInnerHTML={{ __html: processedContent }} 
            />
          );
        }
      });
    });

    return allHighlights.length > 0 
      ? allHighlights 
      : [<li key="no-preview">No matching preview available.</li>];
  }, [highlight]);

  // Update highlights only when highlight prop changes
  useEffect(() => {
    if (highlight !== previousHighlight.current) {
      const newHighlights = processHighlights();
      setHighlights(newHighlights);
      previousHighlight.current = highlight;
    }
  }, [highlight, processHighlights]);

  // Limit the number of highlights based on the previewLimit
  const limitedHighlights = useMemo(() => {
    if (previewLimit === -1) {
      return highlights; // No limit
    }

    return highlights.slice(0, previewLimit);
  }, [highlights, previewLimit]);

  return (
    <div className="result-preview-container">
      <ul className="result-preview">
        {limitedHighlights}
      </ul>
    </div>
  );
};

export default React.memo(ResultPreview);