import React, { useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMetadata, useText, useAuthor } from '../contexts/metadataContext';
import LoadingGif from '../utils/LoadingGif';
import { Text, Author } from '../../types';
import './Metadata.css';

interface UseTextExtendedResult {
  text: Text | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthorExtendedResult {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
}

const TextPage: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();
  const { isLoading, error } = useMetadata();
  const { text } = useText(textId || '') as UseTextExtendedResult;
  const { author } = useAuthor(text?.author_id || '') as UseAuthorExtendedResult;

  const labelMap = useMemo(() => [
    { key: 'id' as keyof Text, label: 'Text ID' },
    { key: 'title_ar' as keyof Text, label: 'Arabic Title' },
    { key: 'title_lat' as keyof Text, label: 'Latinized Title' },
    { key: 'ed_info' as keyof Text, label: 'Edition' },
    { key: 'ed_tl' as keyof Text, label: 'Edition (Latinized)' },
    { key: 'length' as keyof Text, label: 'Word Length' },
    { key: 'tags' as keyof Text, label: 'Genre' },
    // { key: 'uri' as keyof Text, label: 'File Link' },
    { key: 'contrib' as keyof Text, label: 'Contributor' },
  ], []);

  const downloadTextAsCSV = useCallback(() => {
    if (!text || !author) return;

    const BOM = '\uFEFF';
    const entries = Object.entries(text)
      .filter(([key]) => labelMap.some(item => item.key === key));

    const authorInfo = [
      ['author_ar', author.author_ar],
      ['author_lat', author.author_lat],
      ['author_death', author.date]
    ];

    const combinedEntries = [...entries, ...authorInfo];
    const csvContent = combinedEntries
      .map(([key, value]) => {
        const escapedValue = `"${String(value).replace(/"/g, '""')}"`;
        return `${key},${escapedValue}`;
      })
      .join('\n');

    const fullContent = BOM + csvContent;
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `nusus${text.id}_${text.title_lat}_metadata.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [text, author, labelMap]);

  if (isLoading) return <LoadingGif />;
  if (error) return <div className="container"><div className='main'><div className='text-content'>Error: {error}</div></div></div>;
  if (!text) return <div className="container"><div className='main'><div className='text-content'>Text not found. ID: {textId}</div></div></div>;
  if (!author) return <div className="container"><div className='main'><div className='text-content'>Author not found for text: {text.title_lat}</div></div></div>;

  return (
    <div className="container">
      <div className='text-content'>
        <h2>
          <ul>
            <li>{text.title_lat}</li>
            <li>{text.title_ar}</li>
          </ul>
        </h2>
        <table className='individual-meta'>
          <tbody>
            <tr>
              <td>Author</td>
              <td>
                <ul>
                  <li>
                    <Link to={`/author/${text.author_id}`}>
                      {text.author_lat}
                    </Link> (d. {text.date})
                  </li>
                  <li>
                    <Link to={`/author/${text.author_id}`}>
                      {text.author_ar}
                    </Link>
                  </li>
                </ul>
              </td>
            </tr>
            {labelMap.map(({ key, label }) => (
              text[key] !== undefined && (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    {key === 'uri' ? ( 
                      <a href={text[key]} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    ) : (
                      Array.isArray(text[key])
                        ? (text[key] as unknown[]).join(', ')
                        : text[key]?.toString()
                    )}
                  </td>
                </tr>
              )
            ))}
            <tr>
              <td>Metadata</td>
              <td>
                <button className="text-button" onClick={downloadTextAsCSV}>
                  Download as CSV
                </button>
              </td>
            </tr>
            <tr>
              <td>Download Text</td>
              <td><em>Coming Soon</em></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TextPage;