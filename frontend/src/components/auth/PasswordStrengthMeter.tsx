"use client";

import { getPasswordStrength } from "@/lib/passwordStrength";

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);
  const segments = [1, 2, 3, 4, 5];

  return (
    <div style={{ marginTop: 8, marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {segments.map((s) => (
          <div
            key={s}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 2,
              background: s <= score ? color : "rgba(255,255,255,0.12)",
              transition: "background 0.25s ease",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color, marginTop: 4, display: "inline-block" }}>{label}</span>
    </div>
  );
}