export default function Loading() {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <span className="loading-mark">
        <span className="brand-icon-c">C</span>
        <span className="brand-icon-z">Z</span>
      </span>
      <span className="sr-only">Carregando</span>
    </div>
  );
}
