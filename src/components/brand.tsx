import Link from "next/link";
import { Zap } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <Zap size={21} fill="currentColor" />
      </span>
      <b>
        Click<span>Zap</span>
      </b>
    </Link>
  );
}
