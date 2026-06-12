import { useState } from 'react';

export default function PreviewTabs({ children }) {
  const [tab, setTab] = useState('Instagram');

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <ul className="nav nav-tabs">
          {['Instagram', 'Facebook', 'Twitter'].map((t) => (
            <li className="nav-item" key={t}>
              <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <div className="text-muted small">Viewing: {tab}</div>
          {children}
        </div>
      </div>
    </div>
  );
}

