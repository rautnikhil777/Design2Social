
export default function PromptForm({ prompt, setPrompt, businessType, setBusinessType, contentType, setContentType, onGenerate }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Prompt</label>
          <textarea
            className="form-control"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create Happy Diwali campaign for ABCD Clinic"
          />
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Business Type</label>
            <select className="form-select" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
              <option>Doctor</option>
              <option>Clinic</option>
              <option>Restaurant</option>
              <option>Shop</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Content Type</label>
            <select className="form-select" value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option value="Flyer">Flyer</option>
              <option value="Reel">Reel</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary w-100" onClick={onGenerate}>
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

