import { useRef } from 'react';

export const EditorToolbar = ({ onInsertMedia, onUploadMedia }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar__actions">
        <button className="button secondary" type="button" onClick={onInsertMedia}>
          Insérer un média
        </button>
        <button className="button secondary" type="button" onClick={handleUploadClick}>
          Upload média
        </button>
      </div>
      <p className="helper">Images, vidéos, liens et citations disponibles via la barre de formatage.</p>
      <input ref={fileInputRef} type="file" onChange={onUploadMedia} style={{ display: 'none' }} />
    </div>
  );
};
