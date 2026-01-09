import { useRef } from 'react';

export const FeaturedMediaField = ({ previewUrl, onPick, onUpload, onClear, helper }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="featured-media">
      <div className="featured-media__preview">
        {previewUrl ? <img src={previewUrl} alt="Media sélectionné" /> : <span>Aucun média</span>}
      </div>
      <div className="featured-media__actions">
        <button className="button secondary" type="button" onClick={onPick}>
          Choisir
        </button>
        <button className="button secondary" type="button" onClick={handleUploadClick}>
          Upload
        </button>
        {onClear ? (
          <button className="button secondary" type="button" onClick={onClear}>
            Retirer
          </button>
        ) : null}
      </div>
      {helper ? <p className="helper">{helper}</p> : null}
      <input ref={fileInputRef} type="file" onChange={onUpload} style={{ display: 'none' }} />
    </div>
  );
};
