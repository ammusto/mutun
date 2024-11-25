import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userDataService } from '../services/userDataService';
import LoadingGif from '../utils/LoadingGif';
import ConfirmationModal from '../modals/ConfirmationModal';
import CollectionsList from './CollectionsList';
import { Collection } from '../../types';
import './Collections.css';

const Collections: React.FC = () => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  
    useEffect(() => {
      const fetchCollections = async () => {
        if (!user?.sub) {
          setIsLoading(false);
          return;
        }
  
        try {
          const userData = await userDataService.getUserData(user.sub);
          const userCollections = userData._source.saved_corpora || [];
          const sortedCollections = [...userCollections].sort((a, b) =>
            new Date(b.last_used).getTime() - new Date(a.last_used).getTime()
          );
          setCollections(sortedCollections);
        } catch (error) {
          console.error('Error fetching collections:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchCollections();
    }, [user]);

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    setIsDeleting(true);

    try {
      if (!user?.sub) throw new Error('User not authenticated');

      await userDataService.deleteCorpus(user.sub, collectionToDelete.id);
      setCollections(collections.filter(c => c.id !== collectionToDelete.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting collection:', error);
    } finally {
      setIsDeleting(false);
      setCollectionToDelete(null);
    }
  };

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCollectionToDelete(null);
  };

  return (
    <div className="container">
      <div className="text-content">
        <h2>Create a Collection</h2>
        <div className="collections-intro">
          <p>
            The mutūn meta-corpus draws from two sources for its digitized texts: al-Maktaba al-Shāmila and the OpenITI corpus. The latter is itself a meta-corpus
            drawing from an array of collections. In addition to being able to sort and search through these pre-determined collections and genres, users
            can also create their own custom collections, save them, and search them.
          </p>
          <p>You can create custom collections based on genre, corpus source (al-Maktaba al-Shīʿiyya, Graceo-Arabic, etc.), time period, and so on.</p>
        </div>

        {isAuthenticated ? (
          isLoading ? (
            <LoadingGif />
          ) : (
            <>
              <h2>Your Collections</h2>
              <CollectionsList
                collections={collections}
                onDeleteClick={handleDeleteClick}
              />

              <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Collection"
                message={
                  <div>
                    <p>Are you sure you want to delete collection "<strong>{collectionToDelete?.name}</strong>"?</p>
                    <p>This action cannot be undone.</p>
                  </div>
                }
                confirmText="Delete"
                confirmButtonClass="delete-button"
                isProcessing={isDeleting}
              />
            </>
          )
        ) : (
          <div className="login-prompt">
            <p>Please <button onClick={() => loginWithRedirect()} className="text-button">log in</button> to create and manage your collections.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Collections;