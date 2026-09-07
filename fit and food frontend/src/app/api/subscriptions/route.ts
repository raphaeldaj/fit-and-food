import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getEffectivePrice } from "@/lib/pricing";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { encryptField } from "@/lib/security/crypto";

function nextDueDate(slot: "LUNDI" | "JEUDI") {
  const now = new Date();
  const targetDay = slot === "LUNDI" ? 1 : 4;
  const cutoffDay = slot === "LUNDI" ? 5 : 2;
  const cutoffPassed = now.getDay() > cutoffDay || (now.getDay() === cutoffDay && now.getHours() >= 23 && now.getMinutes() >= 59);
  const daysToAdd = ((targetDay - now.getDay() + 7) % 7) || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + (cutoffPassed ? daysToAdd + 7 : daysToAdd));
  return date;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`subscribe:${ip}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes. Réessaie dans un instant." }, { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour t'abonner." }, { status: 401 });

  const body = await req.json();
  const { packId, mixedGoal, slot, paymentMethod, address, phone, gymId, items } = body;

  if (!packId || !slot || !paymentMethod || !address || !phone || !items?.length) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const subscription = await db.subscription.create({
    data: {
      userId: user.id,
      packId,
      mixedGoal: !!mixedGoal,
      slot,
      paymentMethod,
      address: encryptField(address),
      phone: encryptField(phone),
      gymId: gymId || null,
      nextDueDate: nextDueDate(slot),
      items: { create: items.map((it: { mealId: string; quantity: number }) => ({ mealId: it.mealId, quantity: it.quantity })) },
    },
  });

  const pack = await db.pack.findUnique({ where: { id: packId } });
  const order = await db.order.create({
    data: { subscriptionId: subscription.id, amount: pack ? getEffectivePrice(pack) : 0, status: "PENDING" },
  });

  await db.adminLog.create({
    data: { adminName: "Système", action: `Nouvelle souscription de ${user.fullName} — ${pack?.formule ?? ""} (${pack?.goal ?? ""})` },
  });

  return NextResponse.json({ subscriptionId: subscription.id, orderId: order.id }, { status: 201 });
}