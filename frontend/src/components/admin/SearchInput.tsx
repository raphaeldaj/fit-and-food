"use client";

export default function SearchInput({
  value, onChange, placeholder = "Rechercher...",
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-border rounded-md px-3 py-2 text-sm w-full sm:w-64"
    />
  );
}