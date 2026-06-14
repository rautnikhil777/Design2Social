// NEW REEL FEATURE

function safeCaption(caption) {
  return String(caption || '');
}

async function postZapierWebhook({ type, videoUrl, caption }) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes('PASTE_YOUR_ZAPIER_URL_HERE')) {
    throw new Error('Missing ZAPIER_WEBHOOK_URL');
  }

  const payload = {
    type: 'reel',
    videoUrl,
    caption: safeCaption(caption)
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // Zapier might return 2xx with no useful body.
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text ? text.slice(0, 2000) : `Zapier webhook failed: ${res.status}`);
  }

  let result = null;
  try {
    result = await res.json();
  } catch {
    // ignore
  }

  return result;
}

module.exports = {
  publishToZapier: postZapierWebhook
};

