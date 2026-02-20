import { NextResponse } from "next/server";
import { offers, Offer } from "@/data/mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (propertyId) {
    const filtered = offers.filter((o) => o.propertyId === propertyId);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { propertyId, amount } = body as { propertyId: string; amount: number };

  if (!propertyId || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid offer" }, { status: 400 });
  }

  const newOffer: Offer = {
    id: `offer-${Date.now()}`,
    propertyId,
    contactId: "contact-guest",
    amount,
    status: "Pending",
  };

  // In a real app this would persist to a database.
  // For now we push to the in-memory array so the response is consistent.
  offers.push(newOffer);

  return NextResponse.json(newOffer, { status: 201 });
}
