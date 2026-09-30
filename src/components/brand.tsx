import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon" aria-label="CZ">
        <span className="brand-icon-c">C</span>
        <span className="brand-icon-z">Z</span>
      </span>
      <b>
        Click<span>Zap</span>
      </b>
    </Link>
  );
}
