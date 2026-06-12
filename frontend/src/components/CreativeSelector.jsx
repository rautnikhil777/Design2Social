
function CardButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`btn w-100 text-start ${active ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function CreativeSelector({ options, selectedTemplate, onSelect }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Select a Design</h5>
        <div className="row g-3">
          {options.map((opt, index) => (
            <div className="col-md-4" key={`${opt.template}-${index}`}> 
              <CardButton active={selectedTemplate === opt.template} onClick={() => onSelect(opt)}>
                <div className="p-2">
                  {opt.type === 'Flyer' ? (
                    <img
                      src={opt.template}
                      alt="template"
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.closest('.p-2');
                        if (parent) parent.querySelector('.no-template')?.remove();
                        const msg = document.createElement('div');
                        msg.className = 'no-template mt-1 text-muted small';
                        msg.textContent = 'No Template Available';
                        e.currentTarget.parentElement?.appendChild(msg);
                      }}
                    />
                  ) : (
                    <img
                      src={opt.template}
                      alt="reel template"
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.closest('.p-2');
                        if (parent) parent.querySelector('.no-template')?.remove();
                        const msg = document.createElement('div');
                        msg.className = 'no-template mt-1 text-muted small';
                        msg.textContent = 'No Template Available';
                        e.currentTarget.parentElement?.appendChild(msg);
                      }}
                    />
                  )}

                  {!opt.template ? <div className="mt-1 text-muted small">No Template Available</div> : null}
                  <div className="mt-2 fw-semibold">{opt.type}</div>
                </div>
              </CardButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

