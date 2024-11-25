import React, { FC } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isProcessing?: boolean;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = '',
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          {title}
        </div>
        <div className="modal-text">
          {message}
          <div className="modal-actions">
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={confirmButtonClass}
            >
              {isProcessing ? `${confirmText}...` : confirmText}
            </button>
            <button onClick={onClose}>
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;