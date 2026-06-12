
export default function FlyerCard({ template }) {
  return (
    <img
      src={template}
      alt="flyer"
      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }}
    />
  );
}

