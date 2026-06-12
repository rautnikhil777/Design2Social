import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BrandColorPicker from '../components/BrandColorPicker';
import CreativeSelector from '../components/CreativeSelector';
import LogoUploader from '../components/LogoUploader';
import Navbar from '../components/Navbar';
import PreviewCard from '../components/PreviewCard';
import PreviewTabs from '../components/PreviewTabs';
import PromptForm from '../components/PromptForm';
import PublishStatus from '../components/PublishStatus';
import QuoteEditor from '../components/QuoteEditor';

import { generateAIImage } from '../services/aiImage';
import { setAuthToken } from '../services/apiClient';
import { saveCreative } from '../services/creativeService';
import { generateCreative } from '../services/generateService';
import { publishCreative } from '../services/publishService';
import { uploadLogo } from '../services/uploadService';

export default function DashboardPage() {
  const nav = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const [prompt, setPrompt] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [businessType, setBusinessType] = useState('Clinic');
  const [contentType, setContentType] = useState('Flyer');

  const [loadingGen, setLoadingGen] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [selected, setSelected] = useState(null);

  const [quote, setQuote] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandColor, setBrandColor] = useState('#0d6efd');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [saved, setSaved] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiImageLoaded, setAiImageLoaded] = useState(false);

  async function onGenerateAIImage() {
  const promptToUse = (aiPrompt || prompt || '').trim();

  if (!promptToUse) {
    setAiError('Please enter AI prompt first');
    setAiImage('');
    setAiImageLoaded(false);
    return;
  }

  // clear old state
  setAiError('');
  setAiLoading(true);
  setAiImage('');
  setAiImageLoaded(false);

  try {
    const data = await generateAIImage(promptToUse);
    const nextImage = data?.imageUrl || '';

    if (!nextImage) {
      throw new Error('AI image URL not returned');
    }

    setAiImage(nextImage);
  } catch (e) {
    console.error('[AI] generateAIImage error:', e);
    setAiImage('');
    setAiImageLoaded(false);

    const msg = e?.message || 'AI generation failed';
    setAiError(msg);
  } finally {
    setAiLoading(false);
  }
}

  async function onGenerate() {
    setLoadingGen(true);
    setPublishStatus(null);
    setSaved(null);
    setSelected(null);
    setGenResult(null);

    try {
      const data = await generateCreative({ prompt, businessType });
      setGenResult(data);

      const options = contentType === 'Flyer' ? data?.flyers : data?.reels;
      if (options?.length) {
        setSelected(options[0]);
      }
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Generate failed');
    } finally {
      setLoadingGen(false);
    }
  }

  async function onLogoUpload(file) {
    if (!file) return;

    setUploading(true);

    try {
      const data = await uploadLogo(file);

      setLogoUrl(
        data?.fullUrl ||
          `http://localhost:4000${data?.logo || ''}`
      );
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e.message ||
          'Upload failed'
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSaveAndNext() {
    if (!selected) return;

    setSaved(null);
    setPublishStatus(null);

    try {
      const data = await saveCreative({
        prompt,
        type: selected.type,
        quote,
        template: selected.template
      });

      setSaved(data.creative);

      localStorage.setItem(
        'draftCreative',
        JSON.stringify({
          creative: {
            ...data.creative,
            aiImage
          },
          brand: {
            companyName,
            color: brandColor,
            logoUrl
          }
        })
      );

      nav('/preview', { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Save failed');
    }
  }

  async function onPublish() {
    if (!saved?._id) return;

    setPublishLoading(true);

    try {
      const data = await publishCreative({ creativeId: saved._id });
      setPublishStatus(data.results);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Publish failed');
    } finally {
      setPublishLoading(false);
    }
  }

  const contentOptions = genResult
    ? contentType === 'Flyer'
      ? genResult?.flyers || []
      : genResult?.reels || []
    : [];

  const brand = {
    companyName,
    color: brandColor,
    logoUrl
  };

  const creative = selected
    ? {
        ...selected,
        quote,
        aiImage
      }
    : aiImage
    ? {
        type: contentType,
        template: 'AI Generated',
        quote,
        aiImage
      }
    : null;

  return (
    <div>
      <Navbar />

      <div className="container py-4">
        <div className="row g-3">
          <div className="col-lg-5">
            <PromptForm
              prompt={prompt}
              setPrompt={setPrompt}
              businessType={businessType}
              setBusinessType={setBusinessType}
              contentType={contentType}
              setContentType={setContentType}
              onGenerate={onGenerate}
            />

            {loadingGen ? (
              <div className="mt-3 alert alert-info">Generating...</div>
            ) : null}

            {genResult ? (
              <div className="mt-3">
                <CreativeSelector
                  options={contentOptions}
                  selectedTemplate={selected?.template}
                  onSelect={(opt) => setSelected(opt)}
                />
              </div>
            ) : null}

            <div className="mt-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Edit branding (MVP)</h5>

                  <div className="mb-2">
                    <label className="form-label">Company Name</label>
                    <input
                      className="form-control"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ABCD Clinic"
                    />
                  </div>

                  <div className="mb-2">
                    <BrandColorPicker
                      color={brandColor}
                      setColor={setBrandColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="row g-3">
              <div className="col-12">
                <LogoUploader
                  onUpload={onLogoUpload}
                  disabled={uploading}
                  previewUrl={logoUrl}
                />
              </div>

              <div className="col-12">
                <QuoteEditor quote={quote} setQuote={setQuote} />
              </div>

              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">AI Image Generator</h5>

                    <div className="mb-2">
                      <label className="form-label">AI Prompt</label>
                      <input
                        className="form-control"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. A modern clinic flyer background, bright and professional"
                      />
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      onClick={onGenerateAIImage}
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Generating...' : 'Generate AI Image'}
                    </button>

                    {aiError ? (
                      <div className="alert alert-warning mt-3 mb-0">
                        {aiError}
                      </div>
                    ) : null}

                    <div className="mt-3">
                      {aiImage ? (
                        <img
                          src={aiImage}
                          alt="AI generated"
                          style={{
                            width: '100%',
                            height: 220,
                            objectFit: 'cover',
                            borderRadius: 8
                          }}
                          onLoad={() => setAiImageLoaded(true)}
                          onError={() => {
                            setAiImageLoaded(false);
                            setAiError(
                              'Image failed to load. Please try again in a few seconds.'
                            );
                          }}
                        />
                      ) : (
                        <div className="text-muted small">
                          AI image preview will appear here.
                        </div>
                      )}

                      {aiImage && !aiImageLoaded && !aiError ? (
                        <div className="text-muted small mt-2">Loading image...</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <PreviewTabs>
                  <PreviewCard creative={creative} brand={brand} />
                </PreviewTabs>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-outline-primary flex-fill"
                onClick={onSaveAndNext}
                disabled={!selected && !aiImage}
              >
                Save & Preview
              </button>

              <button
                className="btn btn-success flex-fill"
                onClick={onPublish}
                disabled={!saved || publishLoading}
              >
                {publishLoading ? 'Publishing...' : 'Publish (Simulation)'}
              </button>
            </div>

            <PublishStatus status={publishStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}