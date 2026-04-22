// returned by mock endpoints
export interface SupplierHotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

// returned to the client
export interface HotelResult {
  name: string;
  price: number;
  supplier: "Supplier A" | "Supplier B";
  commissionPct: number;
}

// used internally during deduplication
export interface HotelGroup {
  [hotelName: string]: {
    supplierA?: SupplierHotel;
    supplierB?: SupplierHotel;
  };
}

// Query params for /api/hotels
export interface HotelQuery {
  city: string;
  minPrice?: number;
  maxPrice?: number;
}
