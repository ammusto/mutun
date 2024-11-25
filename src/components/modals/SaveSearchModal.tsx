import React, { FC } from 'react';
interface SaveSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    searchName: string;
    setSearchName: (name: string) => void;
    isSaving: boolean;
}
const SaveSearchModal: FC<SaveSearchModalProps> = ({
    isOpen,
    onClose,
    onSave,
    searchName,
    setSearchName,
    isSaving
}) => {
    if (!isOpen) return null;
    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">Save Search</div>
                <div className="modal-text">
                    <input
                        type="text"
                        placeholder="Enter a name for this search"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <div className="modal-actions">
                        <button
                            onClick={onSave}
                            disabled={isSaving || !searchName.trim()}
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
export default SaveSearchModal;