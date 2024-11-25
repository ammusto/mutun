import React from 'react';

interface SlopInputProps {
  value: number;          
  onChange: (value: number) => void; 
}

const SlopInput: React.FC<SlopInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10); 
    if (!isNaN(val) && val >= 1 && val <= 10) {
      onChange(val); 
    }
  };

  return (
    <div className="slop-input-container">
      <label>
        Words Between:
        <input
          type="number"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          className="slop-input"
        />
      </label>
    </div>
  );
};

export default SlopInput;
