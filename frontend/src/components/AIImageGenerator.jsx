import { useEffect, useState } from 'react';
import { generateAIImage } from '../services/aiImage';

export default function AIImageGenerator({
  aiPrompt,
  setAiPrompt,
  generatedImage,
  setGeneratedImage
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Revoke object URL when component unmounts or image changes.
  useEffect(() => {
    return () => {
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
    };
  }, [generatedImage]);

  const handleGenerate = async () => {
    const normalizedPrompt = String(aiPrompt || '').trim();

    if (!normalizedPrompt) {
      setError('Please enter AI prompt');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { imageUrl } = await generateAIImage(normalizedPrompt);

      // Revoke previous blob url (if any) to avoid leaks.
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }

      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err?.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-image-generator-card">
      <h3>AI Image Generator</h3>

      <label htmlFor="aiPrompt">AI Prompt</label>
      <textarea
        id="aiPrompt"
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="Example: Modern dental clinic flyer background, clean blue theme, professional lighting"
        rows={4}
      />

      <button type="button" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="preview-box">
        {generatedImage ? (
          <img
            src={generatedImage}
            alt="Generated AI Preview"
            className="generated-image"
          />
        ) : (
          <p>AI image preview will appear here.</p>
        )}
      </div>
    </div>
  );
}

