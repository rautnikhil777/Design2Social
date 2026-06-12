import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PreviewCard from '../components/PreviewCard';
import PreviewTabs from '../components/PreviewTabs';

export default function PreviewPage() {
  const [creative, setCreative] = useState(null);
  const [brand, setBrand] = useState({ companyName: '', color: '#0d6efd', logoUrl: '' });

  useEffect(() => {
    const state = JSON.parse(localStorage.getItem('draftCreative') || 'null');
    if (!state) return;

    // keep whatever was saved; editor in this MVP is simplified
    setCreative(state.creative);
    setBrand(state.brand);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <PreviewTabs>
          <PreviewCard creative={creative} brand={brand} />
        </PreviewTabs>

        <div className="text-muted mt-3">
          MVP note: Flyer/Reel editors are simplified placeholders. Save & Publish from Dashboard.
        </div>
      </div>
    </div>
  );
}

