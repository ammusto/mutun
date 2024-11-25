import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMetadata, useAuthor, useAuthorTexts } from '../contexts/metadataContext';
import LoadingGif from '../utils/LoadingGif';
import { Author, Text } from '../../types';
import './Metadata.css';

interface UseAuthorResult {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthorTextsResult {
  texts: Text[];
  isLoading: boolean;
  error: string | null;
}

const AuthorPage: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const { isLoading, error } = useMetadata();
  const { author } = useAuthor(authorId || '') as UseAuthorResult;
  const { texts: authorTexts } = useAuthorTexts(authorId || '') as UseAuthorTextsResult;

  const labelMap = [
    { key: 'author_lat' as keyof Author, label: 'Latinized Name' },
    { key: 'author_ar' as keyof Author, label: 'Arabic Name' },
    { key: 'date' as keyof Author, label: 'Death Year' },
    { key: 'bio' as keyof Author, label: 'Biography' },
    { key: 'cit' as keyof Author, label: 'Citation' },
    { key: 'incrp' as keyof Author, label: 'In Corpus' },
  ];

  if (isLoading) return <LoadingGif />;
  if (error) return <div className="container"><div className='main'><div className='text-content'>Error: {error}</div></div></div>;
  if (!author) return <div className="container"><div className='main'><div className='text-content'>Author not found. ID: {authorId}</div></div></div>;

  return (
    <div className="container">
      <div className="text-content">
        <h2>
          <ul>
            <li>{author.author_lat}</li>
            <li>{author.author_ar}</li>
          </ul>
        </h2>
        <table className="individual-meta">
          <tbody>
            {labelMap.map(({ key, label }) => (
              author[key] !== undefined && author[key] !== null && (
                <tr key={key}>
                  <td>{label}</td>
                  <td dangerouslySetInnerHTML={{ __html: String(author[key]) }}></td>
                </tr>
              )
            ))}
            <tr>
              <td>Texts in Corpus</td>
              <td>
                <ul>
                  {authorTexts?.map((text: Text) => (
                    <li key={text.id}>
                      <Link to={`/text/${text.id}`}>
                        {text.title_lat || text.title_ar}
                      </Link>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorPage;