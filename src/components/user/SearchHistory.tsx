// components/user/SearchHistory.tsx
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userDataService } from '../services/userDataService';
import { toast } from 'react-toastify';
import SearchTable from './SearchTable';
import SaveSearchModal from '../modals/SaveSearchModal';
import { SearchHistoryProps, SearchQuery, SearchHistoryItem } from '../../types';

interface ParsedQuery {
  type: string;
  terms: Array<{
    term: string;
    searchIn: string;
    definite?: boolean;
    proclitic?: boolean;
    type?: string;
    position?: number;
  }>;
  slop?: number;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  searchHistory = [], 
  savedSearches = [], 
  onUpdate 
}) => {
  const { user } = useAuth0();
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<SearchHistoryItem | null>(null);

  const parseSearchTerms = (query: SearchQuery): ParsedQuery => {
    const { type } = query;

    switch (type) {
      case 'simple':
        return {
          type: 'Simple',
          terms: [{
            term: query.term || '',
            searchIn: query.search_in || 'tok',
            definite: query.definite,
            proclitic: query.proclitic
          }]
        };

      case 'advanced': {
        const andTerms = (query.and_terms || '').split(',')
          .map(term => {
            const [word, field] = term.split(':');
            return word ? { term: word, searchIn: field, type: 'and' } : null;
          })
          .filter((term): term is NonNullable<typeof term> => term !== null);

        const orTerms = (query.or_terms || '').split(',')
          .map(term => {
            const [word, field] = term.split(':');
            return word ? { term: word, searchIn: field, type: 'or' } : null;
          })
          .filter((term): term is NonNullable<typeof term> => term !== null);

        return {
          type: 'Advanced',
          terms: [...andTerms, ...orTerms]
        };
      }

      case 'proximity': {
        return {
          type: 'Proximity',
          terms: [
            {
              term: query.term1?.split(':')[0] || '',
              searchIn: query.term1?.split(':')[1] || 'tok',
              position: 1
            },
            {
              term: query.term2?.split(':')[0] || '',
              searchIn: query.term2?.split(':')[1] || 'tok',
              position: 2
            }
          ],
          slop: query.slop
        };
      }

      default:
        return {
          type: 'Unknown',
          terms: []
        };
    }
  };

  const renderFormattedTerms = (parsedQuery: ParsedQuery): string => {
    if (!parsedQuery.terms.length) return 'No terms';

    const renderTerm = (term: ParsedQuery['terms'][0]) => {
      let result = `${term.term} (${term.searchIn})`;
      if (term.definite || term.proclitic) {
        const modifiers = [
          term.definite && 'definite',
          term.proclitic && 'proclitic'
        ].filter(Boolean).join(', ');
        result += ` [${modifiers}]`;
      }
      return result;
    };

    switch (parsedQuery.type) {
      case 'Simple':
        return renderTerm(parsedQuery.terms[0]);

      case 'Advanced':
        return parsedQuery.terms
          .map((term, i, arr) => {
            const termStr = renderTerm(term);
            const connector = i < arr.length - 1 ? 
              (term.type === 'and' ? ' AND ' : ' OR ') : '';
            return termStr + connector;
          })
          .join('');

      case 'Proximity':
        return `${renderTerm(parsedQuery.terms[0])} within ${parsedQuery.slop} tokens of ${renderTerm(parsedQuery.terms[1])}`;

      default:
        return 'Invalid search type';
    }
  };

  const handleSaveSearch = (historyEntry: SearchHistoryItem) => {
    setSelectedHistoryEntry(historyEntry);
    setSearchName('');
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!searchName.trim()) {
      toast.error('Please enter a name for the search');
      return;
    }

    setSavingSearch(true);
    try {
      if (selectedHistoryEntry && user?.sub) {
        await userDataService.saveSearchFromHistory(user.sub, selectedHistoryEntry, searchName);
        toast.success('Search saved successfully');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save search');
      console.error('Error saving search:', error);
    } finally {
      setSavingSearch(false);
      setShowSaveModal(false);
    }
  };

  const handleUnsaveSearch = async (searchId: string) => {
    try {
      if (user?.sub) {
        await userDataService.unsaveSearch(user.sub, searchId);
        toast.success('Search removed from saved searches');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to remove search');
      console.error('Error removing search:', error);
    }
  };

  const columns = [
    { 
      key: 'results_count', 
      label: 'Results' 
    },
    { 
      key: 'texts', 
      label: 'Texts',
      render: (item: SearchHistoryItem) => item.query.text_ids?.length || 'All'
    },
    {
      key: 'type',
      label: 'Type',
      render: (item: SearchHistoryItem) => parseSearchTerms(item.query).type
    },
    {
      key: 'timestamp',
      label: 'Date',
      render: (item: SearchHistoryItem) => new Date(item.timestamp).toLocaleDateString()
    },
    {
      key: 'searchQuery',
      label: 'Search Query',
      render: (item: SearchHistoryItem) => renderFormattedTerms(parseSearchTerms(item.query))
    }
  ];

  return (
    <div className="search-history-container">
      <div className="recent-searches">
        <h3>Recent Searches</h3>
        <SearchTable
          data={searchHistory}
          type="history"
          parseSearchTerms={parseSearchTerms}
          formatTerms={renderFormattedTerms}
          onAction={handleSaveSearch}
          actionLabel="Save"
          columns={columns}
          emptyMessage="No Search History"
        />
      </div>

      <div className="saved-searches">
        <h3>Saved Searches</h3>
        <SearchTable
          data={savedSearches}
          type="saved"
          parseSearchTerms={parseSearchTerms}
          formatTerms={renderFormattedTerms}
          onAction={(search) => handleUnsaveSearch(search.id)}
          actionLabel="Remove"
          columns={[...columns.slice(0, -1), { key: 'name', label: 'Name' }]}
          emptyMessage="No Saved Searches"
        />
      </div>

      <SaveSearchModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleConfirmSave}
        searchName={searchName}
        setSearchName={setSearchName}
        isSaving={savingSearch}
      />
    </div>
  );
};

export default React.memo(SearchHistory);