import React from 'react';
import './modals.css';

interface SaveCorpusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  collectionName: string;
  setCollectionName: (name: string) => void;
  isSaving: boolean;
  textCount: number;
}

const SaveCorpusModal: React.FC<SaveCorpusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  collectionName,
  setCollectionName,
  isSaving,
  textCount
}) => {
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCollectionName(e.target.value);
  };

  return (
    <div className="modal">
      <div className='modal-content'>
        <div className='modal-header'>Save Text Collection</div>
        <div className='modal-text'>
          Save {textCount} selected texts as a custom collection
          <input
            type="text"
            placeholder="Enter a name for this collection"
            value={collectionName}
            onChange={handleInputChange}
          />
          <div className="modal-actions">
            <button
              onClick={onSave}
              disabled={isSaving || !collectionName.trim()}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveCorpusModal;