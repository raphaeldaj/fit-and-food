import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import HeaderNav from "./HeaderNav";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="125 205 235 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fit & Food">
      <g fill="#FF5B0A">
        <path d="M 339.00,261.00 L 337.00,259.00 L 318.00,261.00 L 295.00,261.00 L 280.00,263.00 L 265.00,270.00 L 257.00,278.00 L 252.00,289.00 L 252.00,295.00 L 250.00,301.00 L 251.00,332.00 L 254.00,333.00 L 257.00,330.00 L 261.00,329.00 L 271.00,319.00 L 271.00,316.00 L 274.00,311.00 L 276.00,299.00 L 283.00,289.00 L 289.00,286.00 L 324.00,283.00 L 334.00,275.00 Z" />
        <path d="M 148.00,259.00 L 147.00,265.00 L 153.00,277.00 L 160.00,282.00 L 172.00,285.00 L 191.00,285.00 L 201.00,289.00 L 208.00,297.00 L 213.00,318.00 L 225.00,330.00 L 232.00,333.00 L 234.00,332.00 L 233.00,289.00 L 227.00,277.00 L 223.00,272.00 L 221.00,272.00 L 217.00,268.00 L 208.00,264.00 L 203.00,264.00 L 199.00,262.00 L 184.00,260.00 L 176.00,261.00 L 175.00,260.00 Z" />
        <path d="M 349.00,220.00 L 347.00,219.00 L 345.00,220.00 L 341.00,219.00 L 337.00,220.00 L 334.00,219.00 L 272.00,220.00 L 270.00,221.00 L 272.00,228.00 L 272.00,235.00 L 270.00,241.00 L 272.00,242.00 L 337.00,242.00 L 344.00,238.00 L 348.00,228.00 Z" />
        <path d="M 136.00,222.00 L 141.00,238.00 L 149.00,242.00 L 212.00,242.00 L 214.00,241.00 L 213.00,238.00 L 214.00,221.00 L 212.00,219.00 L 192.00,219.00 L 191.00,220.00 L 142.00,220.00 L 139.00,219.00 Z" />
        <path d="M 234.00,217.00 L 228.00,224.00 L 227.00,231.00 L 228.00,238.00 L 231.00,242.00 L 237.00,246.00 L 248.00,246.00 L 254.00,242.00 L 257.00,238.00 L 259.00,231.00 L 257.00,224.00 L 249.00,216.00 Z" />
      </g>
    </svg>
  );
}

export default async function Header() {
  const user = await getCurrentUser();
  const role = user?.role ?? null;

  return (
    <header className="bg-secondary sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 relative">
        <Link href={role === "ADMIN" ? "/admin" : "/"} className="flex items-center gap-2 text-white text-lg font-heading font-extrabold">
          <LogoIcon className="h-8 w-auto" />
          FIT &amp; FOOD <span className="text-primary">.</span>
        </Link>

        <HeaderNav role={role} />
      </div>
    </header>
  );
}