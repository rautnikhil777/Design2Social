
export default function BrandColorPicker({ color, setColor }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Primary Color</h5>
        <div className="d-flex align-items-center gap-3 mt-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 48, height: 36, border: 'none' }} />
          <input className="form-control" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

