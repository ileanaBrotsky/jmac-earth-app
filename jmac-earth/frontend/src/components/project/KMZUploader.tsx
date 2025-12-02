import { useState, useCallback, useRef } from 'react';

interface KMZUploaderProps {
  file?: File | null;
  error?: string;
  onFileChange: (file: File | null) => void;
  uploading?: boolean;
  maxSizeMB?: number;
}

const KMZUploader = ({ file, onFileChange, error, uploading = false, maxSizeMB = 20 }: KMZUploaderProps) => {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const maxBytes = maxSizeMB * 1024 * 1024;

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const dropped = event.dataTransfer.files?.[0];
      if (dropped) {
        if (!dropped.name.toLowerCase().endsWith('.kmz')) {
          onFileChange(null);
          setLocalError('El archivo debe tener extensi\u00f3n .kmz');
          return;
        }
        if (dropped.size > maxBytes) {
          onFileChange(null);
          setLocalError(`El archivo supera el l\u00edmite de ${maxSizeMB} MB`);
          return;
        }
        setLocalError(null);
        onFileChange(dropped);
      }
    },
    [onFileChange, maxBytes, maxSizeMB]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      onFileChange(null);
      return;
    }
    if (!selected.name.toLowerCase().endsWith('.kmz')) {
      onFileChange(null);
      setLocalError('El archivo debe tener extensi\u00f3n .kmz');
      return;
    }
    if (selected.size > maxBytes) {
      onFileChange(null);
      setLocalError(`El archivo supera el l\u00edmite de ${maxSizeMB} MB`);
      return;
    }
    setLocalError(null);
    onFileChange(selected);
  };

  return (
    <div
      className={`uploader ${dragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter') handleClick();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".kmz"
        className="hidden"
        onChange={handleChange}
      />
      <p style={{ margin: 0, fontWeight: 600 }}>Arrastra tu KMZ o haz clic para cargar</p>
      <small className="helper-text">
        El archivo debe ser generado por Google Earth. Tama\u00f1o m\u00e1ximo: {maxSizeMB} MB.
      </small>
      {file && (
        <div className="status-row">
          <span>Archivo listo:</span>
          <span>{file.name}</span>
        </div>
      )}
      {uploading && (
        <div className="status-row">
          <span>Subiendo...</span>
          <span className="helper-text">Enviando archivo y par\u00e1metros al backend.</span>
        </div>
      )}
      {(error || localError) && <p className="error-text">{error ?? localError}</p>}
    </div>
  );
};

export default KMZUploader;
