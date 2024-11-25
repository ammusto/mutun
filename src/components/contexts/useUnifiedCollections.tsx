import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userDataService } from '../services/userDataService';
import type { Text, Collection, Option } from '../../types';

interface CacheData {
  data: Collection[];
  timestamp: number;
  userId: string;
}

const CACHE_KEY = 'unified-collections';
const CACHE_EXPIRY = 24; // 24 hours

export const useUnifiedCollections = (metadataCollections?: Option[]) => {
  const { user, isAuthenticated } = useAuth0();
  const [unifiedCollections, setUnifiedCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Memoize formatted metadata collections with stable reference
  const formattedMetadata = useMemo(() => {
    if (!metadataCollections?.length) return [];
    
    return metadataCollections.map(collection => ({
      id: `metadata_${collection.value}`,
      name: collection.label,
      text_ids: [], // Changed from texts object to empty array
      created_at: '',
      last_used: '',
      value: `metadata_${collection.value}`,
      label: collection.label,
      isUser: false,
      collectionName: collection.value,
      sortOrder: 2
    } as Collection)); // Explicit type casting to Collection
  }, [metadataCollections]);

  useEffect(() => {
    const loadUnifiedCollections = async () => {
      try {
        // If not authenticated, just use metadata collections
        if (!isAuthenticated) {
          setUnifiedCollections(formattedMetadata);
          setIsLoading(false);
          return;
        }

        // Check cache first
        const cachedDataStr = localStorage.getItem(CACHE_KEY);
        let userCollections: Collection[] = [];

        if (cachedDataStr) {
          const cachedData: CacheData = JSON.parse(cachedDataStr);
          if (
            Date.now() - cachedData.timestamp < CACHE_EXPIRY * 60 * 60 * 1000 &&
            cachedData.userId === user?.sub
          ) {
            userCollections = cachedData.data;
          }
        }

        // If no valid cache, load user collections
        if (userCollections.length === 0 && user?.sub) {
          const userData = await userDataService.getUserData(user.sub);
          userCollections = (userData?._source?.saved_corpora || []).map((collection: any) => ({
            ...collection,
            value: `user_${collection.id}`,
            label: `${collection.name} (u)`,
            isUser: true,
            // Handle both old and new format
            text_ids: collection.text_ids || 
                     (collection.texts ? Object.keys(collection.texts).map(id => parseInt(id)) : []),
            sortOrder: 1
          } as Collection));

          // Update cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: userCollections,
            timestamp: Date.now(),
            userId: user.sub
          }));
        }

        // Combine and sort both collections in a single update
        const combined = [...userCollections, ...formattedMetadata].sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.label.localeCompare(b.label);
        });

        setUnifiedCollections(combined);
      } catch (error) {
        console.error('Error loading unified collections:', error);
        setUnifiedCollections(formattedMetadata);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load if we have metadata collections
    if (formattedMetadata.length > 0) {
      loadUnifiedCollections();
    }
  }, [isAuthenticated, user?.sub, formattedMetadata]);

  const textMatchesCollections = useMemo(() => (
    text: Text,
    selectedCollections: string[]
  ): boolean => {
    if (!selectedCollections || selectedCollections.length === 0) return true;

    return selectedCollections.some(collectionId => {
      const collection = unifiedCollections.find(c => c.value === collectionId);
      if (!collection) return false;

      if (collection.isUser) {
        return collection.text_ids.includes(parseInt(String(text.id)));
      } else {
        return text.collection === collection.collectionName;
      }
    });
  }, [unifiedCollections]);
  
  return {
    collections: unifiedCollections,
    isLoading,
    textMatchesCollections
  };
};