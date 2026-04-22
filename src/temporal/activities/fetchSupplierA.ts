import axios from "axios";
import { type SupplierHotel } from "../../types/hotel";

export const fetchSupplierA = async (
  city: string,
): Promise<SupplierHotel[]> => {
  const baseUrl = process.env.SUPPLIER_BASE_URL || "http://localhost:3000";

  try {
    const response = await axios.get(`${baseUrl}/supplierA/hotels`, {
      params: { city },
      timeout: 5000,
    });
    console.log(
      `[Activity] Supplier A returned ${response.data.length} hotels for ${city}`,
    );
    return response.data as SupplierHotel[];
  } catch (err: any) {
    console.error("[Activity] Supplier A failed:", err.message);
    return [];
  }
};
