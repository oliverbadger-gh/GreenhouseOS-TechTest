"use client";

import { useState, useEffect } from "react";
import { Property, Offer } from "@/data/mock";
import { formatGBP } from "@/utils/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function PriceDisplay({ price }: { price: number }) {
  return (
    <p className="text-3xl font-bold text-green-700 mt-2">
      {formatGBP(price)}
    </p>
  );
}

function PropertyHeader({
  address,
  price,
  status,
  listedDate,
}: {
  address: string;
  price: number;
  status: string;
  listedDate: string;
}) {
  const getStatusColor = (s: string) => {
    if (s === "Available") return "bg-green-100 text-green-800";
    if (s === "Sale Agreed") return "bg-yellow-100 text-yellow-800";
    if (s === "Sold") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{address}</h1>
          <PriceDisplay price={price} />
          <p className="text-sm text-gray-400 mt-2">Listed: {listedDate}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function OfferRow({
  amount,
  status,
}: {
  amount: number;
  status: string;
}) {
  const getStatusColor = (s: string) => {
    if (s === "Accepted") return "bg-green-100 text-green-800";
    if (s === "Rejected") return "bg-red-100 text-red-800";
    if (s === "Pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-900">{formatGBP(amount)}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

export default function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerSuccess, setOfferSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [propertyRes, offersRes] = await Promise.all([
        fetch(`${API_URL}/api/properties/${params.id}`),
        fetch(`${API_URL}/api/offers?propertyId=${params.id}`),
      ]);

      const [propertyData, offersData] = await Promise.all([
        propertyRes.json(),
        offersRes.json(),
      ]);

      setProperty(propertyData);
      setLoadingProperty(false);
      setOffers(offersData);
      setLoadingOffers(false);
    };

    fetchData();
  }, [params.id]);

  const highestOffer = offers.length > 0
    ? Math.max(...offers.map((o) => o.amount))
    : 0;
  const isHotProperty = property !== null && highestOffer > property.price;

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError("");
    setOfferSuccess("");

    const parsed = Number(offerAmount);
    if (!offerAmount || isNaN(parsed) || parsed <= 0) {
      setOfferError("Please enter a valid positive amount.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: params.id, amount: parsed }),
      });
      if (!res.ok) throw new Error("Failed to submit offer");
      const newOffer: Offer = await res.json();
      setOffers((prev) => [...prev, newOffer]);
      setOfferAmount("");
      setOfferSuccess(`Offer of ${formatGBP(parsed)} submitted successfully!`);
    } catch {
      setOfferError("Something went wrong. Please try again.");
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <a
        href="/"
        className="text-green-700 hover:underline text-sm mb-4 inline-block"
      >
        ← Back to Properties
      </a>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-200 h-72 flex items-center justify-center relative">
          <span className="text-gray-400 text-6xl">🏠</span>
          {isHotProperty && (
            <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              🔥 Hot Property
            </span>
          )}
        </div>
        <PropertyHeader
          address={property.address}
          price={property.price}
          status={property.status}
          listedDate={property.listedDate}
        />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Offers</h2>
        {loadingOffers ? (
          <p className="text-gray-400 py-4">Loading offers...</p>
        ) : offers.length === 0 ? (
          <p className="text-gray-400 py-4">No offers yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer: Offer) => (
                <OfferRow
                  key={offer.id}
                  amount={offer.amount}
                  status={offer.status}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Make an Offer</h2>
        <form onSubmit={handleSubmitOffer} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">£</span>
            <input
              type="number"
              min="1"
              step="1"
              value={offerAmount}
              onChange={(e) => { setOfferAmount(e.target.value); setOfferError(""); setOfferSuccess(""); }}
              placeholder="Enter amount"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-green-700 text-white text-sm font-semibold rounded-md hover:bg-green-800 transition-colors"
          >
            Submit Offer
          </button>
        </form>
        {offerError && <p className="text-red-600 text-sm mt-2">{offerError}</p>}
        {offerSuccess && <p className="text-green-700 text-sm mt-2">{offerSuccess}</p>}
      </div>
    </div>
  );
}
