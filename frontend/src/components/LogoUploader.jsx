import { useRef, useState } from 'react';

export default function LogoUploader({ onUpload, disabled, previewUrl }) {
  const inputRef = useRef(null);
  const [logoError, setLogoError] = useState('');

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-1">Branding</h5>
            <div className="text-muted small">Upload logo to apply to your creative.</div>
          </div>
          <button className="btn btn-outline-primary" disabled={disabled} onClick={() => inputRef.current?.click()}>
            Upload Logo
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="d-none" onChange={(e) => onUpload(e.target.files?.[0])} />
        </div>

        <div className="mt-3">
          <label className="form-label">Logo Preview</label>
          <div className="border rounded p-2" style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {logoError ? (
              <div className="text-danger small">{logoError}</div>
            ) : null}

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="logo"
                onError={() => {
                  console.log('Logo load failed', previewUrl);
                  setLogoError(`Logo failed to load. URL: ${previewUrl}`);
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: 100,
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div className="text-muted">No logo uploaded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

