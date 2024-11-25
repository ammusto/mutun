import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSearch } from '../contexts/SearchContext';
import { userDataService } from '../services/userDataService';
import { toast } from 'react-toastify';
import SaveCorpusModal from '../modals/SaveCorpusModal';
import { TextDetail } from '../../types';

const SelectedTextsList: React.FC = () => {
  const { selectedTextDetails, selectedTexts, setSelectedTexts, setSelectedTextDetails } = useSearch();
  const { user, isAuthenticated } = useAuth0();
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [collectionName, setCollectionName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleRemoveText = (id: number) => {
    setSelectedTexts((prev) => prev.filter((textId) => textId !== id));
    setSelectedTextDetails((prev) => prev.filter((t) => t.id !== id));
  };
  
  const handleSaveCollection = async () => {
    if (!collectionName.trim()) {
      toast.error('Please enter a name for the collection');
      return;
    }

    setIsSaving(true);
    try {
      await userDataService.saveCorpus(user?.sub || '', {
        name: collectionName,
        texts: selectedTexts
      });
      toast.success('Collection saved successfully');
      setShowSaveModal(false);
      setCollectionName('');
    } catch (error) {
      toast.error('Failed to save collection');
      console.error('Error saving collection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedTextDetails || selectedTextDetails.length === 0) {
    return <div className="text-filter-list"><div className="center">Searching all texts</div></div>;
  }

  return (
    <>
      <div className="text-filter-list selected-texts-list y-overflow">
        {selectedTextDetails.map((text: TextDetail) => (
          <label key={text.id} onClick={() => handleRemoveText(text.id)}>
            <input
              type="checkbox"
              checked={selectedTexts.includes(text.id)}
              onChange={() => handleRemoveText(text.id)}
              className="text-checkbox"
            />
            {text.title} - {text.author} ({text.date})
          </label>
        ))}
      </div>
      {isAuthenticated && selectedTexts.length > 0 && (
        <button
          onClick={() => setShowSaveModal(true)}
          className="save-collection-button"
        >
          Save Selected Texts as Collection
        </button>
      )}
      <SaveCorpusModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveCollection}
        collectionName={collectionName}
        setCollectionName={setCollectionName}
        isSaving={isSaving}
        textCount={selectedTexts.length}
      />
    </>
  );
};

export default React.memo(SelectedTextsList);