import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Collection } from '../../types';
import './Collections.css';

interface CollectionsListProps {
  collections?: Collection[];
  onDeleteClick?: (collection: Collection) => void;
  showActions?: boolean;
  className?: string;
}

const CollectionsList: FC<CollectionsListProps> = ({
  collections = [],
  onDeleteClick,
  showActions = true,
  className = '',
}) => {
  if (!collections.length) {
    return (
      <div className="no-collections">
        <p>No collections found.</p>
        {showActions && (
          <p>
            <Link to="/collections/create">Create your first collection</Link> to start organizing your texts.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`collections-table-container ${className}`}>
      <h3>Your Saved Collections</h3>
      <table className="collections-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Texts</th>
            <th>Last Edited</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <tr key={collection.id}>
              <td>{collection.name}</td>
              <td>{collection.text_ids?.length || 0}</td>
              <td>{new Date(collection.last_used).toLocaleDateString()}</td>
              {showActions && (
                <td>
                  <div className="collection-actions">
                    <Link to={`/collections/edit/${collection.id}`} className="edit-collection-link">
                      Edit
                    </Link>
                    {' - '}
                    <Link to={`/search?collection=${collection.id}`} className="search-collection-link">
                      Search
                    </Link>
                    {onDeleteClick && (
                      <>
                        {' - '}
                        <button
                          onClick={() => onDeleteClick(collection)}
                          className="text-button"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {showActions && (
        <div className="collections-actions">
          <Link to="/collections/create" className="create-collection-button">
            Add New Collection
          </Link>
        </div>
      )}
    </div>
  );
};

export default CollectionsList;