import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getCreativeHistory } from '../services/creativeService';
import { getPublishHistory } from '../services/publishService';

export default function HistoryPage() {
  const [creativeHistory, setCreativeHistory] = useState([]);
  const [publishHistory, setPublishHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, p] = await Promise.all([getCreativeHistory(), getPublishHistory()]);
        setCreativeHistory(c.items || []);
        setPublishHistory(p.items || []);
      } catch (e) {
        // if unauthorized/missing token, just show empties
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h3 className="mb-3">History</h3>
        {loading ? <div className="alert alert-info">Loading...</div> : null}

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Creatives</h5>
                <ul className="list-group list-group-flush">
                  {creativeHistory.length ? (
                    creativeHistory.map((it) => (
                      <li className="list-group-item" key={it._id}>
                        <div className="fw-semibold">{it.type}</div>
                        <div className="small text-muted">{it.prompt}</div>
                        <div className="small">Template: {it.template}</div>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">No creative history yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Publish History</h5>
                <ul className="list-group list-group-flush">
                  {publishHistory.length ? (
                    publishHistory.map((it) => (
                      <li className="list-group-item" key={it._id}>
                        <div className="fw-semibold">{it.platform}</div>
                        <div>Status: {it.status}</div>
                        <div className="small text-muted">{new Date(it.time).toLocaleString()}</div>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">No publish history yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

