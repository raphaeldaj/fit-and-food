import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { decryptField } from "@/lib/security/crypto";

/** Formate un montant en FCFA avec un espace normal (évite les glyphes non supportés par pdfkit). */
function formatFCFA(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function generatePdf(data: {
  orderId: string;
  clientName: string;
  clientPhone: string;
  formule: string;
  goal: string;
  gymName: string;
  amount: number;
  paidAt: string;
  method: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#FF6A13").text("FIT & FOOD", { align: "left" });
    doc.fontSize(10).fillColor("#111B3A").text("Eat Clean, Live Lean — Dakar, Sénégal");
    doc.moveDown(1.5);

    doc.fontSize(16).fillColor("#111B3A").text("Reçu de paiement");
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#555").text(`Commande #${data.orderId.slice(0, 8)}`);
    doc.text(`Date : ${data.paidAt}`);
    doc.moveDown(1);

    doc.fontSize(11).fillColor("#111B3A").text("Client", { underline: true });
    doc.fontSize(10).fillColor("#333").text(data.clientName);
    doc.text(`Téléphone : ${data.clientPhone}`);
    doc.moveDown(1);

    doc.fontSize(11).fillColor("#111B3A").text("Détail de l'abonnement", { underline: true });
    doc.fontSize(10).fillColor("#333");
    doc.text(`Formule : ${data.formule} (${data.goal})`);
    doc.text(`Salle partenaire : ${data.gymName}`);
    doc.text(`Méthode de paiement : ${data.method}`);
    doc.moveDown(1);

    doc.fontSize(13).fillColor("#111B3A").text(`Montant payé : ${formatFCFA(data.amount)} FCFA`, { align: "right" });
    doc.moveDown(2);

    doc.fontSize(8).fillColor("#999").text("Fit & Food — Dakar, Sénégal", { align: "center" });

    doc.end();
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { subscription: { include: { pack: true, gym: true } }, payment: true },
  });

  if (!order || order.subscription.userId !== user.id) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Cette commande n'est pas encore réglée." }, { status: 409 });
  }

  const pdfBuffer = await generatePdf({
    orderId: order.id,
    clientName: user.fullName,
    clientPhone: decryptField(order.subscription.phone),
    formule: order.subscription.pack.formule,
    goal: order.subscription.pack.goal.replace("_", " "),
    gymName: order.subscription.gym?.name ?? "-",
    amount: order.amount,
    paidAt: order.cycleDate.toLocaleDateString("fr-FR"),
    method: order.payment?.method ?? order.subscription.paymentMethod,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recu-fitandfood-${order.id.slice(0, 8)}.pdf"`,
    },
  });
}