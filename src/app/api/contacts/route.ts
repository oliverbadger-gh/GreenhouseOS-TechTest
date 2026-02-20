import { NextResponse } from "next/server";
import { contacts, offers } from "@/data/mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (propertyId) {
    const propertyOffers = offers.filter((o) => o.propertyId === propertyId);
    const contactIds = new Set(propertyOffers.map((o) => o.contactId));
    const filtered = contacts.filter((c) => contactIds.has(c.id));
    return NextResponse.json(filtered);
  }

  return NextResponse.json(contacts);
}
