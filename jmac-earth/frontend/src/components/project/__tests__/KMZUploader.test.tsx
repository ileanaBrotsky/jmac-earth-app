import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import KMZUploader from '../KMZUploader';

describe('KMZUploader', () => {
  it('calls onFileChange when a KMZ file is selected', () => {
    const handleChange = vi.fn();
    const { container } = render(<KMZUploader onFileChange={handleChange} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'project.kmz', { type: 'application/vnd.google-earth.kmz' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(handleChange).toHaveBeenCalledWith(file);
  });
});
