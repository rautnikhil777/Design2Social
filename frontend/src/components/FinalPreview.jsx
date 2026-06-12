export default function FinalPreview({
  platform = 'Instagram',
  companyName,
  quote,
  generatedImage
}) {
  return (
    <div className="final-preview-card">
      <h3>Final Preview</h3>
      <p><strong>Viewing:</strong> {platform}</p>

      <div className="final-preview-frame">
        {generatedImage ? (
          <img
            src={generatedImage}
            alt="Final creative preview"
            className="final-preview-image"
          />
        ) : (
          <div className="placeholder-box">Reel preview placeholder</div>
        )}

        <div className="final-preview-overlay">
          <h4>{companyName || 'Company Name'}</h4>
          <p>{quote || 'Your quote here'}</p>
        </div>
      </div>
    </div>
  );
}