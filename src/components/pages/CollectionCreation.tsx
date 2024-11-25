import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useParams } from 'react-router-dom';
import FilterTab from '../search/FilterTab';
import { useSearch } from '../contexts/SearchContext';
import { useMetadata } from '../contexts/metadataContext';
import { userDataService } from '../services/userDataService';
import SaveCorpusModal from '../modals/SaveCorpusModal';
import LoadingGif from '../utils/LoadingGif';
import Pagination from '../utils/Pagination';
import { Collection, Text } from '../../types';

const TEXTS_PER_PAGE = 25;

const CollectionCreation: React.FC = () => {
    const navigate = useNavigate();
    const { collectionId } = useParams<{ collectionId?: string }>();
    const { user } = useAuth0();
    const { metadata, isLoading: isMetadataLoading } = useMetadata();
    const {
        selectedTexts,
        resetSelection
    } = useSearch();

    // Collection-specific states
    const [collectionTexts, setCollectionTexts] = useState<Text[]>([]);
    const [collectionFilter, setCollectionFilter] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof Text; direction: 'asc' | 'desc' }>({
        column: 'title_ar',
        direction: 'asc'
    });
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
    const [collectionName, setCollectionName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Load existing collection if editing
    useEffect(() => {
        const loadCollection = async () => {
            if (!collectionId || !user?.sub || !metadata?.texts) return;

            setIsLoading(true);
            setError(null);

            try {
                const userData = await userDataService.getUserData(user.sub);
                const collection = userData?._source?.saved_corpora.find((c: Collection) => c.id === collectionId);

                if (collection) {
                    setCollectionName(collection.name);
                    // Handle both old and new formats
                    const textIds = collection.text_ids || 
                                  (collection.text_ids  ? Object.keys(collection.text_ids ).map(id => parseInt(id)) : []);
                    
                    const collectionTextDetails = metadata.texts.filter(text =>
                        textIds.includes(text.id)
                    );
                    setCollectionTexts(collectionTextDetails);
                }
            } catch (error) {
                console.error('Error loading collection:', error);
                setError('Failed to load collection. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadCollection();
    }, [collectionId, user?.sub, metadata?.texts]);

    // Handle adding selected texts to collection
    const handleAddToCollection = useCallback(() => {
        if (selectedTexts.length === 0 || !metadata?.texts) return;

        const textsToAdd = metadata.texts.filter(text =>
            selectedTexts.includes(text.id) &&
            !collectionTexts.some(ct => ct.id === text.id)
        );

        setCollectionTexts(prev => [...prev, ...textsToAdd]);
        resetSelection();
    }, [selectedTexts, metadata?.texts, collectionTexts, resetSelection]);

    // Handle removing text from collection
    const handleRemoveFromCollection = useCallback((textId: number) => {
        setCollectionTexts(prev => prev.filter(text => text.id !== textId));
    }, []);

    // Filter and sort collection texts
    const filteredCollectionTexts = useMemo(() => {
        let filtered = [...collectionTexts];

        if (collectionFilter) {
            const lowercaseFilter = collectionFilter.toLowerCase();
            filtered = filtered.filter(text =>
                text.title_ar?.toLowerCase().includes(lowercaseFilter) ||
                text.title_lat?.toLowerCase().includes(lowercaseFilter) ||
                text.author_ar?.toLowerCase().includes(lowercaseFilter) ||
                text.author_lat?.toLowerCase().includes(lowercaseFilter)
            );
        }

        filtered.sort((a, b) => {
            const valueA = a[sortConfig.column] || '';
            const valueB = b[sortConfig.column] || '';

            if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [collectionTexts, collectionFilter, sortConfig]);

    // Pagination
    const paginatedTexts = useMemo(() => {
        const startIndex = (currentPage - 1) * TEXTS_PER_PAGE;
        return filteredCollectionTexts.slice(startIndex, startIndex + TEXTS_PER_PAGE);
    }, [filteredCollectionTexts, currentPage]);

    // Handle sort
    const handleSort = useCallback((column: keyof Text) => {
        setSortConfig(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    // Handle save collection
    const handleSaveCollection = async () => {
        if (!collectionName.trim()) {
            setError('Collection name cannot be empty.');
            return;
        }

        if (!user?.sub) {
            setError('User is not authenticated.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const collectionData = {
                name: collectionName,
                texts: collectionTexts.map(text => text.id),
            };

            if (collectionId) {
                await userDataService.updateCorpus(user.sub, collectionId, collectionData);
            } else {
                await userDataService.saveCorpus(user.sub, collectionData);
            }

            navigate('/collections');
        } catch (error) {
            console.error('Error saving collection:', error);
            setError('Failed to save collection. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!metadata?.texts || isMetadataLoading) {
        return <LoadingGif />;
    }

    return (
        <div className="container">
            <div className="select-texts-container">
                <h2>{collectionId ? 'Edit Collection' : 'Create New Collection'}</h2>
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <FilterTab
                    initialTextIds={collectionTexts.map(t => t.id)}
                    resetSelection={resetSelection}
                />

                <div className='collections-actions'>
                    <button
                        onClick={handleAddToCollection}
                        disabled={selectedTexts.length === 0}
                        className="add-to-collection-button"
                    >
                        Add Selected to Collection
                    </button>
                </div>

                <div className="collection-texts-section">
                    <h3 className='center'>Collection Texts ({collectionTexts.length})</h3>
                    <input
                        type="text"
                        value={collectionFilter}
                        onChange={(e) => setCollectionFilter(e.target.value)}
                        placeholder="Filter collection texts"
                        className="search-form-input"
                    />

                    <table className="collections-create-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('title_ar')}>Title⇅</th>
                                <th onClick={() => handleSort('author_ar')}>Author⇅</th>
                                <th onClick={() => handleSort('date')}>Death⇅</th>
                                <th onClick={() => handleSort('tags')}>Tags⇅</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTexts.length > 0 ? (
                                paginatedTexts.map((text) => (
                                    <tr key={text.id}>
                                        <td>
                                            <ul>
                                                <li>{text.title_ar}</li>
                                                <li>{text.title_lat}</li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul>
                                                <li>{text.author_sh_ar}</li>
                                                <li>{text.author_sh || text.author_lat}</li>
                                            </ul>
                                        </td>
                                        <td>{text.date || 'N/A'}</td>
                                        <td>{text.tags?.join(', ') || 'N/A'}</td>
                                        <td>
                                            <button
                                                onClick={() => handleRemoveFromCollection(text.id)}
                                                className="remove-text-button"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="center">
                                        Add Text(s) from above
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredCollectionTexts.length}
                        itemsPerPage={TEXTS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    <div className="save-collection-section center">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            disabled={collectionTexts.length === 0}
                            className="save-collection-button"
                        >
                            {collectionId ? 'Update Collection' : 'Create Collection'}
                        </button>
                    </div>

                    <SaveCorpusModal
                        isOpen={showSaveModal}
                        onClose={() => setShowSaveModal(false)}
                        onSave={handleSaveCollection}
                        collectionName={collectionName}
                        setCollectionName={setCollectionName}
                        isSaving={isLoading}
                        textCount={collectionTexts.length}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(CollectionCreation);