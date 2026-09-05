"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu, IconClose } from "@/components/icons";

export default function HeaderNav({ role }: { role: "CLIENT" | "ADMIN" | null }) {
  const [open, setOpen] = useState(false);

  const links =
    role === "ADMIN"
      ? [{ href: "/admin", label: "Dashboard Admin" }]
      : [
          { href: "/", label: "S'abonner" },
          { href: "/mon-espace", label: "Mon Espace Client" },
        ];

  return (
    <>
      <button className="md:hidden text-white p-1" onClick={() => setOpen((v) => !v)} aria-label="Menu">
        {open ? <IconClose size={26} /> : <IconMenu size={26} />}
      </button>

      <ul
        className={`md:flex md:static md:flex-row md:gap-5 md:bg-transparent md:p-0 md:shadow-none
          ${open ? "flex" : "hidden"}
          absolute top-full left-0 right-0 flex-col gap-3 bg-secondary-light px-5 py-4 shadow-xl`}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={() => setOpen(false)} className="text-white text-sm font-medium hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}