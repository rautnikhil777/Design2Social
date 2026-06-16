import { useState } from 'react';

export default function PreviewCard({ creative, brand }) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { type, template, quote, aiImage, offerText, ctaText, aiVideo } = creative || {};
  const { companyName, color, logoUrl, phone, address, website, timing } = brand || {};

  const imageSrc = (aiImage || template || '').trim();
  const normalizedAiVideo = (aiVideo || '').toString().trim();
  const videoSrc = (normalizedAiVideo || template || '').trim();

  // Reel detection: prefer explicit type, creative type, or presence of aiVideo
  const isReelMode =
    type === 'Reel' ||
    creative?.type === 'Reel' ||
    !!normalizedAiVideo;

  // If aiVideo exists in Reel mode, never let template/image preview URLs override it
  const finalVideoSrc = (isReelMode && normalizedAiVideo
    ? normalizedAiVideo
    : (normalizedAiVideo || creative?.videoUrl || videoSrc || '').toString().trim());

  const showImage = !isReelMode && type === 'Flyer' && !!imageSrc;
  const showVideo = isReelMode && !!finalVideoSrc;
  const isAiPreview = !!aiImage?.trim() && imageSrc === aiImage;
  const isTemplatePreview = !!template?.trim() && !isAiPreview;

  if (import.meta.env.DEV) {
    console.debug('[PreviewCard] selected object/type', { type, creativeType: creative?.type });
    console.debug('[PreviewCard] aiVideo', normalizedAiVideo);
    console.debug('[PreviewCard] final videoSrc', finalVideoSrc);
  }

  const showOffer = isTemplatePreview && !!offerText?.trim();
  const showPhone = isTemplatePreview && !!phone?.trim();
  const showAddress = isTemplatePreview && !!address?.trim();
  const showWebsite = isTemplatePreview && !!website?.trim();
  const showTiming = isTemplatePreview && !!timing?.trim();
  const showCTA = isTemplatePreview && !!ctaText?.trim();
  const showInfoBox = showPhone || showAddress || showWebsite || showTiming;

  function onViewImage() {
    if (!imageSrc) return;
    setShowPreviewModal(true);
  }

  function closePreviewModal() {
    setShowPreviewModal(false);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    if (!text) return y;
    const words = String(text).split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i += 1) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }

    if (line) lines.push(line);

    const finalLines = lines.slice(0, maxLines).map((item, index) => {
      if (index === maxLines - 1 && lines.length > maxLines) {
        let trimmed = item;
        while (ctx.measureText(`${trimmed}...`).width > maxWidth && trimmed.length > 0) {
          trimmed = trimmed.slice(0, -1);
        }
        return `${trimmed}...`;
      }
      return item;
    });

    finalLines.forEach((lineText, index) => {
      ctx.fillText(lineText, x, y + index * lineHeight);
    });

    return y + finalLines.length * lineHeight;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function downloadComposedImage() {
    if (!imageSrc || !isTemplatePreview) return;

    try {
      setIsDownloading(true);

      const baseImg = await loadImage(imageSrc);
      if (!baseImg) return;

      const logoImg = logoUrl ? await loadImage(logoUrl).catch(() => null) : null;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = baseImg.naturalWidth || 1200;
      const height = baseImg.naturalHeight || 1200;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(baseImg, 0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0.82)');
      gradient.addColorStop(0.38, 'rgba(0,0,0,0.45)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.10)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const pad = Math.max(24, Math.round(width * 0.03));
      const badgeY = pad;
      const badgeHeight = Math.max(34, Math.round(height * 0.045));
      const brandColor = color || '#0d6efd';

      if (showOffer) {
        ctx.font = `700 ${Math.max(18, Math.round(width * 0.018))}px Arial`;
        const text = offerText.trim();
        const textWidth = ctx.measureText(text).width;
        const badgeWidth = textWidth + 34;
        const badgeX = width - pad - badgeWidth;

        roundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
        ctx.fillStyle = brandColor;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, badgeX + 17, badgeY + badgeHeight / 2);
      }

      const contentX = pad;
      const contentY = height - pad;
      const logoSize = Math.max(56, Math.round(width * 0.08));
      const gap = Math.max(16, Math.round(width * 0.015));
      const textStartX = logoImg ? contentX + logoSize + gap : contentX;
      const contentWidth = width - textStartX - pad;

      if (logoImg) {
        roundedRect(ctx, contentX, contentY - logoSize, logoSize, logoSize, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.drawImage(logoImg, contentX + 6, contentY - logoSize + 6, logoSize - 12, logoSize - 12);
      }

      let currentY = contentY - Math.max(180, Math.round(height * 0.22));

      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.font = `800 ${Math.max(28, Math.round(width * 0.032))}px Arial`;
      currentY = wrapText(
        ctx,
        companyName || 'Company Name',
        textStartX,
        currentY,
        contentWidth,
        Math.max(34, Math.round(height * 0.04)),
        2
      );

      currentY += 8;

      ctx.font = `${Math.max(18, Math.round(width * 0.018))}px Arial`;
      currentY = wrapText(
        ctx,
        quote || 'Your quote here',
        textStartX,
        currentY,
        contentWidth,
        Math.max(24, Math.round(height * 0.026)),
        3
      );

      currentY += 14;

      if (showInfoBox) {
        const infoBoxX = textStartX;
        const infoBoxY = currentY;
        const infoBoxWidth = contentWidth;
        const lineFontSize = Math.max(16, Math.round(width * 0.015));
        const lineGap = 10;

        const infoLines = [];
        if (showPhone) infoLines.push(`Phone: ${phone}`);
        if (showAddress) infoLines.push(`Address: ${address}`);
        if (showWebsite) infoLines.push(`Website: ${website}`);
        if (showTiming) infoLines.push(`Timing: ${timing}`);

        const lineHeight = lineFontSize + lineGap;
        const boxHeight = 18 + infoLines.length * lineHeight;

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        roundedRect(ctx, infoBoxX, infoBoxY, infoBoxWidth, boxHeight, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = `${lineFontSize}px Arial`;
        ctx.textBaseline = 'top';

        let infoY = infoBoxY + 10;
        infoLines.forEach((line) => {
          wrapText(ctx, line, infoBoxX + 12, infoY, infoBoxWidth - 24, lineHeight, 2);
          infoY += lineHeight;
        });

        currentY = infoBoxY + boxHeight + 14;
      }

      if (showCTA) {
        ctx.font = `700 ${Math.max(18, Math.round(width * 0.018))}px Arial`;
        const btnText = ctaText.trim();
        const btnTextWidth = ctx.measureText(btnText).width;
        const btnWidth = btnTextWidth + 36;
        const btnHeight = Math.max(42, Math.round(height * 0.055));

        roundedRect(ctx, textStartX, currentY, btnWidth, btnHeight, 10);
        ctx.fillStyle = brandColor;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';
        ctx.fillText(btnText, textStartX + 18, currentY + btnHeight / 2);
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(companyName || 'flyer').replace(/\s+/g, '-').toLowerCase()}-preview.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to download composed image:', error);
      setIsDownloading(false);
      alert('Image download failed. Make sure image/logo URL allows canvas access.');
    }
  }

  function renderPreviewContent(height = 340, isModal = false) {
    return (
      <div style={{ position: 'relative', minHeight: isModal ? '70vh' : 320 }}>
        <img
          src={imageSrc}
          alt={isAiPreview ? 'AI generated flyer preview' : 'Flyer preview'}
          style={{
            width: '100%',
            height: isModal ? '90vh' : height,
            objectFit: isModal ? 'contain' : 'cover',
            display: 'block',
            background: isModal ? '#000' : 'transparent'
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0.10) 70%, rgba(0,0,0,0.02) 100%)'
          }}
        />

        {isAiPreview ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.3
            }}
          >
            AI Generated
          </div>
        ) : null}

        {showOffer ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: isModal ? 110 : 12,
              background: color || '#0d6efd',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0,0,0,0.18)'
            }}
          >
            {offerText}
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 14,
            color: '#fff'
          }}
        >
          <div className="d-flex align-items-start gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                style={{
                  height: isModal ? 52 : 48,
                  width: isModal ? 52 : 48,
                  objectFit: 'contain',
                  background: '#fff',
                  borderRadius: 10,
                  padding: 4,
                  flexShrink: 0
                }}
              />
            ) : null}

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: isModal ? 24 : 22,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: 4,
                  textShadow: '0 2px 8px rgba(0,0,0,0.35)'
                }}
              >
                {companyName || 'Company Name'}
              </div>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.4,
                  marginBottom: 10,
                  textShadow: '0 2px 8px rgba(0,0,0,0.35)'
                }}
              >
                {quote || 'Your quote here'}
              </div>

              {showInfoBox ? (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    marginBottom: showCTA ? 10 : 0
                  }}
                >
                  {showPhone ? (
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      <strong>Phone:</strong> {phone}
                    </div>
                  ) : null}

                  {showAddress ? (
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      <strong>Address:</strong> {address}
                    </div>
                  ) : null}

                  {showWebsite ? (
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      <strong>Website:</strong> {website}
                    </div>
                  ) : null}

                  {showTiming ? (
                    <div style={{ fontSize: 13 }}>
                      <strong>Timing:</strong> {timing}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showCTA ? (
                <button
                  type="button"
                  style={{
                    background: color || '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 16px',
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.20)',
                    pointerEvents: 'none'
                  }}
                >
                  {ctaText}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderVideoContent(height = 340, isModal = false) {
    return (
      <div style={{ position: 'relative', minHeight: isModal ? '70vh' : 320, background: '#000' }}>
        <video
          // key on src prevents stale playback; no manual play()/pause() to avoid AbortError
          key={finalVideoSrc}
          src={finalVideoSrc}
          controls
          playsInline
          muted
          preload="metadata"
          style={{
            width: '100%',
            height: isModal ? '90vh' : height,
            objectFit: 'contain',
            display: 'block',
            background: '#000'
          }}
          onLoadedMetadata={() => {
            if (import.meta.env.DEV) console.debug('[Reel Preview] metadata loaded');
          }}
          onError={(e) => {
            if (import.meta.env.DEV) console.debug('[Reel Preview] video error', e);
          }}
        />
      </div>
    );
  }


  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h5 className="card-title mb-0">Final Preview</h5>
              {showImage ? (
                <small className="text-muted">
                  {isAiPreview ? 'AI image preview' : 'Template image preview'}
                </small>
              ) : showVideo ? (
                <small className="text-muted">Reel video preview</small>
              ) : null}
            </div>

            {showImage ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={onViewImage}
              >
                View Image
              </button>
            ) : null}
          </div>

          <div
            className="border rounded overflow-hidden mt-2"
            style={{
              background: '#f8f9fa',
              minHeight: 340,
              position: 'relative'
            }}
          >
            {type === 'Flyer' ? (
              showImage ? (
                renderPreviewContent(340, false)
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center text-muted"
                  style={{ height: 340, background: '#eef1f4' }}
                >
                  Flyer preview will appear here
                </div>
              )
            ) : type === 'Reel' ? (
              showVideo ? (
                renderVideoContent(340, false)
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center flex-column text-center p-4"
                  style={{
                    height: 340,
                    background: `linear-gradient(135deg, ${color || '#0d6efd'}22, #ffffff)`
                  }}
                >
                  <div className="fw-bold mb-2" style={{ fontSize: 20 }}>
                    Reel Preview
                  </div>
                  <div className="text-muted" style={{ maxWidth: 260 }}>
                    Reel preview will appear here.
                  </div>
                </div>
              )
            ) : (
              <div
                className="d-flex align-items-center justify-content-center flex-column text-center p-4"
                style={{
                  height: 340,
                  background: `linear-gradient(135deg, ${color || '#0d6efd'}22, #ffffff)`
                }}
              >
                <div className="fw-bold mb-2" style={{ fontSize: 20 }}>
                  Image Preview
                </div>
                <div className="text-muted" style={{ maxWidth: 260 }}>
                  Image preview placeholder. Generated Image details will appear here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPreviewModal ? (
        <div
          onClick={closePreviewModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1055,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 900,
              maxHeight: '90vh',
              overflow: 'hidden',
              borderRadius: 18,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              background: '#000'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 3,
                display: 'flex',
                gap: 8
              }}
            >
              {isTemplatePreview ? (
                <button
                  type="button"
                  onClick={downloadComposedImage}
                  disabled={isDownloading}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    background: color || '#0d6efd',
                    color: '#fff',
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    opacity: isDownloading ? 0.7 : 1
                  }}
                >
                  {isDownloading ? 'Downloading...' : 'Download Image'}
                </button>
              ) : null}

              <button
                type="button"
                onClick={closePreviewModal}
                style={{
                  width: 36,
                  height: 36,
                  border: 'none',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {renderPreviewContent(340, true)}
          </div>
        </div>
      ) : null}
    </>
  );
}