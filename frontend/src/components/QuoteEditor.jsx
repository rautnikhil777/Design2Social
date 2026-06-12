
export default function QuoteEditor({ quote, setQuote }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Add Quote</h5>
        <textarea
          className="form-control mt-2"
          rows={3}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="e.g., Book now for 20% off!"
        />
      </div>
    </div>
  );
}

