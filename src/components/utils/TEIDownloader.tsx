import React from 'react';
import { TEIDownloaderProps } from '../../types';

const downloadTEI = async (
  textId: string | number, 
  titleTl: string, 
  linkText: string, 
  img?: boolean
): Promise<void> => {
  const fileName = `nuṣūṣ${textId}_${titleTl}.xml`;
  const fileUrl = `/texts/tei/${textId}.xml`;

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    alert('Error downloading the file');
  }
};

const TEIDownloader: React.FC<TEIDownloaderProps> = ({ 
  textId, 
  titleTl, 
  linkText, 
  img 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    downloadTEI(textId, titleTl, linkText, img);
  };

  return (
    <button
      onClick={handleClick}
      className={img ? 'text-button img-download-link' : 'text-button'}
    >
      {linkText}
    </button>
  );
};

export default React.memo(TEIDownloader);