import { useState, useCallback, useRef } from 'react';

interface KMZUploaderProps {
  file?: File | null;
  error?: string;
  onFileChange: (file: File | null) => void;
}

const KMZUploader = ({ file, onFileChange, error }: KMZUploaderProps) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const dropped = event.dataTransfer.files?.[0];
      if (dropped) {
        if (!dropped.name.toLowerCase().endsWith('.kmz')) {
          onFileChange(null);
          return;
        }
        onFileChange(dropped);
      }
    },
    [onFileChange]
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
      return;
    }
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
      <small className="helper-text">El archivo debe ser generado por Google Earth.</small>
      {file && (
        <div className="status-row">
          <span>Archivo listo:</span>
          <span>{file.name}</span>
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default KMZUploader;
