
export default function PublishStatus({ status }) {
  if (!status || !Array.isArray(status) || status.length === 0) return null;

  return (
    <div className="alert alert-success mt-3">
      <div className="fw-bold">Publish Results</div>
      <ul className="mb-0">
        {status.map((s) => (
          <li key={s.platform}>
            {s.platform}: {s.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

