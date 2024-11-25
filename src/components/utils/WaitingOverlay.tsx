import React from 'react';
import LoadingGif from './LoadingGif';
import './WaitingOverlay.css';

interface WaitingOverlayProps {
  isVisible: boolean;
}

const WaitingOverlay: React.FC<WaitingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="waiting-overlay">
      <div className="waiting-content">
        <LoadingGif divs={false} />
      </div>
    </div>
  );
};

export default React.memo(WaitingOverlay);