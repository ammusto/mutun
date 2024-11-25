import React, { useState, FC } from 'react';
import SearchInputSelect from './SearchInputSelect';
import { SearchField, AdvancedSearchProps } from '../../types';

const AdvancedSearch: FC<AdvancedSearchProps> = ({
  andFields,
  orFields,
  handleFieldChange,
  addAdvancedField,
  removeAdvancedField
}) => {
  const [activeTab, setActiveTab] = useState<'AND' | 'OR'>('AND');

  const renderFields = (fields: SearchField[], type: 'AND' | 'OR') => {
    return fields.map((field, index) => (
      <div key={index} className="search-field-container">
        <SearchInputSelect
          index={index}
          searchField={field}
          handleFieldChange={(index: number, name: string, value: string | boolean) => 
            handleFieldChange(index, name, value, type)
          }
          searchType="advanced"
        />
        {/* Only show remove button for fields beyond the first two */}
        <button
          className="remove-field"
          onClick={() => removeAdvancedField(index, type)}
          style={{ visibility: index >= 2 ? 'visible' : 'hidden' }}
        >
          X
        </button>
      </div>
    ));
  };

  return (
    <>
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'AND' ? 'active' : ''}`}
          onClick={() => setActiveTab('AND')}
        >
          AND
        </button>
        <button
          className={`search-tab ${activeTab === 'OR' ? 'active' : ''}`}
          onClick={() => setActiveTab('OR')}
        >
          OR
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'AND' && (
          <div className="and-fields">
            {renderFields(andFields, 'AND')}
            {andFields.length < 5 && (
              <button
                className="add-field"
                onClick={() => addAdvancedField('AND')}
              >
                Add Additional Term
              </button>
            )}
          </div>
        )}

        {activeTab === 'OR' && (
          <div className="or-fields">
            {renderFields(orFields, 'OR')}
            {orFields.length < 5 && (
              <button
                className="add-field"
                onClick={() => addAdvancedField('OR')}
              >
                Add Additional Term
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(AdvancedSearch);