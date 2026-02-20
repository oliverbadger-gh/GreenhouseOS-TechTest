"use client";

import { useState, useEffect } from "react";
import PropertyCard from "./components/PropertyCard";
import { EnrichedProperty, PropertyStatus } from "@/data/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const STATUS_OPTIONS: ("All" | PropertyStatus)[] = ["All", "Available", "Sale Agreed", "Sold"];

export default function HomePage() {
  const [properties, setProperties] = useState<EnrichedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"All" | PropertyStatus>("All");

  useEffect(() => {
    const fetchProperties = async () => {
      const res = await fetch(`${API_URL}/api/properties`);
      const data = await res.json();
      setProperties(data);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <div className="flex items-center gap-4 mt-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | PropertyStatus)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p className="text-gray-500 text-sm">
            Showing {statusFilter === "All" ? properties.length : properties.filter((p) => p.status === statusFilter).length} properties
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties
          .filter((p) => statusFilter === "All" || p.status === statusFilter)
          .map((property: EnrichedProperty) => (
            <PropertyCard key={property.id} property={property} />
          ))}
      </div>
    </div>
  );
}
