
export default function PreviewCard({ creative, brand }) {
  const { type, template, quote } = creative || {};
  const { companyName, color, logoUrl } = brand || {};

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Final Preview</h5>
        <div
          className="border rounded p-2 mt-2"
          style={{ background: color || '#fff', minHeight: 320, position: 'relative' }}
        >
          {type === 'Flyer' ? (
            <img
              src={template}
              alt="Flyer template"
              style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 10 }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center" style={{ height: 280 }}>
              <div className="text-muted">Reel preview placeholder</div>
            </div>
          )}

          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" style={{ height: 36, width: 36, objectFit: 'contain', background: '#fff', borderRadius: 8 }} />
            ) : null}
            <div className="text-white fw-bold mt-2">{companyName || 'Company Name'}</div>
            <div className="text-white">{quote || 'Your quote here'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

