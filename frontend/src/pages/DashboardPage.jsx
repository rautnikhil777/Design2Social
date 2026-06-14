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

import { generateBrandedAIImage } from '../services/aiImage';
import { setAuthToken } from '../services/apiClient';
import { saveCreative } from '../services/creativeService';
import { generateCreative } from '../services/generateService';
import { publishCreative } from '../services/publishService';
import { uploadLogo } from '../services/uploadService';

// NEW REEL FEATURE
import { generateReel, publishReel, uploadReel } from '../services/reelService.js';

const ZAPIER_WEBHOOK_URL = import.meta.env.VITE_ZAPIER_WEBHOOK_URL || '';

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

  // NEW REEL FEATURE
  const [reelLoading, setReelLoading] = useState(false);
  const [reelError, setReelError] = useState('');
  const [aiVideo, setAiVideo] = useState('');

  const [loadingGen, setLoadingGen] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [selected, setSelected] = useState(null);

  const [quote, setQuote] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandColor, setBrandColor] = useState('#0d6efd');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // NEW EXTRA INFO FOR NORMAL PREVIEW
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [ctaText, setCtaText] = useState('Book Now');
  const [offerText, setOfferText] = useState('');
  const [timing, setTiming] = useState('');

  const [saved, setSaved] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiImageLoaded, setAiImageLoaded] = useState(false);

  const [publishToSocialLoading, setPublishToSocialLoading] = useState(false);
  const [publishToSocialResult, setPublishToSocialResult] = useState(null);
  const [publishToSocialMessage, setPublishToSocialMessage] = useState('');

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [downloadMessage, setDownloadMessage] = useState('');

  async function onGenerateAIImage() {
    setReelError('');
    setAiVideo('');

    const promptToUse = (aiPrompt || prompt || '').trim();

    if (!promptToUse) {
      setAiError('Please enter AI prompt first');
      setAiImage('');
      setAiImageLoaded(false);
      return;
    }

    setAiError('');
    setAiLoading(true);
    setAiImage('');
    setAiImageLoaded(false);

    try {
      const data = await generateBrandedAIImage({
        prompt: promptToUse,
        companyName,
        quote,
        brandColor,
        logoUrl
      });

      const nextImage = data?.imageUrl || '';

      if (!nextImage) {
        throw new Error('AI image URL not returned');
      }

      setAiImage(nextImage);
    } catch (e) {
      console.error('[AI] generateAIImage error:', e);
      setAiImage('');
      setAiImageLoaded(false);
      setAiError(e?.message || 'AI generation failed');
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
      setLogoUrl(data?.fullUrl || `http://localhost:4000${data?.logo || ''}`);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onSaveAndNext() {
    if (!selected && !aiImage) return;

    setSaved(null);
    setPublishStatus(null);

    try {
      const data = await saveCreative({
        prompt,
        type: selected?.type || contentType,
        quote,
        template: selected?.template || 'AI Generated'
      });

      setSaved(data.creative);

      localStorage.setItem(
        'draftCreative',
        JSON.stringify({
          creative: {
            ...data.creative,
            aiImage,
            ctaText,
            offerText
          },
          brand: {
            companyName,
            color: brandColor,
            logoUrl,
            phone,
            address,
            website,
            timing
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
    logoUrl,
    phone,
    address,
    website,
    timing
  };

  const creative = selected
    ? {
        ...selected,
        quote,
        aiImage,
        ctaText,
        offerText
      }
    : aiImage
    ? {
        type: contentType,
        template: 'AI Generated',
        quote,
        aiImage,
        ctaText,
        offerText
      }
    : null;

  const generatedImageUrl =
    aiImage || selected?.previewUrl || selected?.imageUrl || selected?.url || '';

  const generatedReelUrl = aiVideo || '';
  const hasImage = !!generatedImageUrl;
  const hasReel = !!generatedReelUrl;

  const isAiImage = !!aiImage && aiImage === generatedImageUrl;
  const publishCaption = isAiImage ? 'AI Generated Image' : 'Uploaded Image';

  function isProbablyBlob(value) {
    if (!value) return false;
    return typeof Blob !== 'undefined' && value instanceof Blob;
  }

  function isProbablyDataUrl(url) {
    return typeof url === 'string' && /^data:image\//i.test(url);
  }

  async function blobToFile(blob, filename) {
    if (!blob) return null;
    const safeName = filename || 'image';
    const ext = blob?.type?.split('/')?.[1] || 'png';
    return new File([blob], `${safeName}.${ext}`, { type: blob.type || `image/${ext}` });
  }

  async function urlToFile(url, filename) {
    if (!url || typeof url !== 'string') return null;
    const res = await fetch(url);
    const blob = await res.blob();
    return blobToFile(blob, filename);
  }

  async function uploadToCloudinaryUnsigned(file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Missing Cloudinary env vars');
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.status}`);
    }

    return await res.json();
  }

  async function onPublishToSocial() {
    if (!ZAPIER_WEBHOOK_URL || ZAPIER_WEBHOOK_URL.includes('PASTE_YOUR_ZAPIER_URL_HERE')) return;

    setPublishToSocialResult(null);
    setPublishToSocialMessage('');

    if (!hasImage) {
      setPublishToSocialMessage('Generate or select an image first');
      return;
    }

    setPublishToSocialLoading(true);

    const payload = {
      imageUrl: generatedImageUrl,
      caption: publishCaption
    };

    try {
      let fileToUpload = null;

      if (isProbablyBlob(aiImage)) {
        fileToUpload = await blobToFile(aiImage, 'ai_generated');
      } else if (isProbablyBlob(generatedImageUrl)) {
        fileToUpload = await blobToFile(generatedImageUrl, 'ai_generated');
      } else {
        try {
          fileToUpload = await urlToFile(generatedImageUrl, 'ai_generated');
        } catch (_) {
          fileToUpload = null;
        }
      }

      if (fileToUpload) {
        try {
          const cloudRes = await uploadToCloudinaryUnsigned(fileToUpload);
          const secureUrl = cloudRes?.secure_url;
          if (secureUrl) {
            payload.imageUrl = secureUrl;
          } else {
            throw new Error('Cloudinary response missing secure_url');
          }
        } catch (cloudErr) {
          // fallback silently
        }
      }

      let sentOk = false;
      try {
        const ok = navigator.sendBeacon(ZAPIER_WEBHOOK_URL, JSON.stringify(payload));
        sentOk = !!ok;
      } catch (beaconErr) {}

      if (!sentOk) {
        await fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      setPublishToSocialResult('success');
      setPublishToSocialMessage('Publish Success');
    } catch (e) {
      console.error('[Zapier] publish error:', e);
      setPublishToSocialResult('failed');
      setPublishToSocialMessage('Publish Failed');
    } finally {
      setPublishToSocialLoading(false);
    }
  }

  async function onDownloadImage() {
    if (!hasImage) return;

    setDownloadResult(null);
    setDownloadMessage('');
    setDownloadLoading(true);

    try {
      const anchor = document.createElement('a');
      anchor.href = generatedImageUrl;
      const safeName = publishCaption.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
      anchor.download = `${safeName}.png`;
      anchor.target = '_blank';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setDownloadResult('success');
      setDownloadMessage('Download Complete');
    } catch (e) {
      console.error('[Download] error:', e);
      setDownloadResult('failed');
      setDownloadMessage('Download Failed');
    } finally {
      setDownloadLoading(false);
    }

    if (!downloadResult) {
      setDownloadMessage('Download Started');
    }
  }

  async function onGenerateReel() {
    const promptToUse = (aiPrompt || prompt || '').trim();
    if (!promptToUse) {
      setReelError('Please enter AI prompt first');
      return;
    }

    setReelError('');
    setReelLoading(true);
    setAiVideo('');

    try {
      const { videoUrl, caption } = await generateReel({
        prompt: promptToUse,
        caption: quote || ''
      });

      const uploadRes = await uploadReel({ videoUrl });
      const secureUrl = uploadRes?.videoUrl;

      if (!secureUrl) throw new Error('Cloudinary video URL not returned');

      await publishReel({
        videoUrl: secureUrl,
        caption: caption || quote || 'AI Generated Reel'
      });

      setAiVideo(secureUrl);
    } catch (e) {
      console.error('[Reel] error:', e);
      setReelError(e?.response?.data?.message || e?.message || 'Failed to generate reel');
    } finally {
      setReelLoading(false);
    }
  }

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

            <div className="mt-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Generate Type</h5>
                  <div className="d-flex gap-2 mb-2">
                    <button
                      type="button"
                      className={contentType === 'Flyer' ? 'btn btn-primary flex-fill' : 'btn btn-outline-primary flex-fill'}
                      onClick={() => setContentType('Flyer')}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      className={contentType === 'Reel' ? 'btn btn-primary flex-fill' : 'btn btn-outline-primary flex-fill'}
                      onClick={() => setContentType('Reel')}
                    >
                      Reel
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success w-100"
                    disabled={reelLoading || contentType !== 'Reel'}
                    onClick={onGenerateReel}
                  >
                    {reelLoading ? 'Generating Reel...' : 'Generate Reel'}
                  </button>

                  {reelError ? (
                    <div className="alert alert-warning mt-3 mb-0">{reelError}</div>
                  ) : null}
                </div>
              </div>
            </div>

            {loadingGen ? <div className="mt-3 alert alert-info">Generating...</div> : null}

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
                    <BrandColorPicker color={brandColor} setColor={setBrandColor} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Extra Information for Final Preview</h5>

                  <div className="mb-2">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Address</label>
                    <input
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Pimpri, Pune"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Website / Instagram</label>
                    <input
                      className="form-control"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="www.example.com / @yourbrand"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Offer Text</label>
                    <input
                      className="form-control"
                      value={offerText}
                      onChange={(e) => setOfferText(e.target.value)}
                      placeholder="20% Off This Week"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">CTA Button Text</label>
                    <input
                      className="form-control"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Book Now"
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label">Business Timing</label>
                    <input
                      className="form-control"
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      placeholder="Mon - Sat, 10 AM - 8 PM"
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
                      disabled={aiLoading || contentType !== 'Flyer'}
                    >
                      {aiLoading ? 'Generating...' : 'Generate Branded AI Image'}
                    </button>

                    {aiError ? (
                      <div className="alert alert-warning mt-3 mb-0">{aiError}</div>
                    ) : null}

                    <div className="mt-3">
                      {contentType === 'Reel' ? (
                        aiVideo ? (
                          <video
                            src={aiVideo}
                            controls
                            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : (
                          <div className="text-muted small">AI Image preview will appear here.</div>
                        )
                      ) : aiImage ? (
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
                            setAiError('Image failed to load. Please try again in a few seconds.');
                          }}
                        />
                      ) : (
                        <div className="text-muted small">AI image preview will appear here.</div>
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

            <div className="mt-3">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary flex-fill"
                  onClick={onPublishToSocial}
                  disabled={
                    contentType !== 'Flyer' ||
                    publishToSocialLoading ||
                    !hasImage ||
                    !ZAPIER_WEBHOOK_URL ||
                    ZAPIER_WEBHOOK_URL.includes('PASTE_YOUR_ZAPIER_URL_HERE')
                  }
                >
                  {publishToSocialLoading ? 'Publishing...' : '📤 Publish to Social Media'}
                </button>

                <button
                  className="btn btn-outline-success flex-fill"
                  onClick={onDownloadImage}
                  disabled={contentType !== 'Flyer' || downloadLoading || !hasImage}
                >
                  {downloadLoading ? '💾 Saving...' : '💾 Save / Download Image'}
                </button>
              </div>

              {publishToSocialMessage || (!hasImage ? 'Generate or select an image first' : '') ? (
                <div
                  className={
                    publishToSocialResult === 'success'
                      ? 'alert alert-success mt-2 mb-0'
                      : publishToSocialResult === 'failed'
                      ? 'alert alert-danger mt-2 mb-0'
                      : 'alert alert-info mt-2 mb-0'
                  }
                  role="status"
                >
                  {publishToSocialMessage || (!hasImage ? 'Generate or select an image first' : '')}
                </div>
              ) : null}

              {downloadMessage ? (
                <div
                  className={
                    downloadResult === 'success'
                      ? 'alert alert-success mt-2 mb-0'
                      : downloadResult === 'failed'
                      ? 'alert alert-danger mt-2 mb-0'
                      : 'alert alert-info mt-2 mb-0'
                  }
                  role="status"
                >
                  {downloadMessage}
                </div>
              ) : null}
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