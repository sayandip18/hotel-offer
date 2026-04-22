import {
  type SupplierHotel,
  type HotelResult,
  type HotelGroup,
} from "../../types/hotel";

export const dedupeHotels = async (
  supplierAHotels: SupplierHotel[],
  supplierBHotels: SupplierHotel[],
): Promise<HotelResult[]> => {
  const group: HotelGroup = {};

  // Group Supplier A hotels
  for (const hotel of supplierAHotels) {
    const key = hotel.name.toLowerCase();
    if (!group[key]) group[key] = {};
    group[key].supplierA = hotel;
  }

  // Group Supplier B hotels
  for (const hotel of supplierBHotels) {
    const key = hotel.name.toLowerCase();
    if (!group[key]) group[key] = {};
    group[key].supplierB = hotel;
  }

  // Main dedupe logic
  const results: HotelResult[] = Object.values(group).map((entry) => {
    const { supplierA, supplierB } = entry;

    if (supplierA && !supplierB) {
      return {
        name: supplierA.name,
        price: supplierA.price,
        supplier: "Supplier A",
        commissionPct: supplierA.commissionPct,
      };
    }

    if (supplierB && !supplierA) {
      return {
        name: supplierB.name,
        price: supplierB.price,
        supplier: "Supplier B",
        commissionPct: supplierB.commissionPct,
      };
    }

    const cheaper =
      supplierA!.price <= supplierB!.price ? supplierA! : supplierB!;
    return {
      name: cheaper.name,
      price: cheaper.price,
      supplier: cheaper === supplierA ? "Supplier A" : "Supplier B",
      commissionPct: cheaper.commissionPct,
    };
  });

  console.log(`Dedupe complete — ${results.length} unique hotels`);
  return results;
};
