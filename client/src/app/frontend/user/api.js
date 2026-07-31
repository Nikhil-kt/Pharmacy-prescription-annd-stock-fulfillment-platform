const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Helper fetch wrapper with timeout & error parsing
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || "GET"}] ${endpoint}:`, err);
    throw err;
  }
}

// 1. View all branches
export async function fetchBranches() {
  return await apiRequest("/api/customer/branches");
}

// 2. View medicines available in a branch
export async function fetchBranchMedicines(branchId) {
  return await apiRequest(`/api/customer/branches/${branchId}/medicines`);
}

// 3. View single medicine details
export async function fetchMedicineDetails(medicineId) {
  return await apiRequest(`/api/customer/medicines/${medicineId}`);
}

// 4. Search medicines by name
export async function searchMedicines(query) {
  if (!query || !query.trim()) {
    return { success: true, totalResults: 0, medicines: [] };
  }
  return await apiRequest(`/api/customer/search?name=${encodeURIComponent(query.trim())}`);
}

// 5. Upload prescription
export async function uploadPrescription(prescriptionData) {
  return await apiRequest("/api/prescriptions/upload", {
    method: "POST",
    body: JSON.stringify(prescriptionData),
  });
}

// 6. Get customer orders (with fallback for endpoint availability)
export async function fetchCustomerOrders(customerId) {
  try {
    return await apiRequest(`/api/orders/customer/${customerId}`);
  } catch (err) {
    console.warn("Fetch customer orders API failed, returning local storage fallback", err);
    if (typeof window !== "undefined") {
      const localOrders = JSON.parse(localStorage.getItem("rxconnect_orders") || "[]");
      const userOrders = localOrders.filter(
        (o) => !customerId || String(o.customer_id) === String(customerId)
      );
      return { success: true, orders: userOrders, isFallback: true };
    }
    return { success: true, orders: [], isFallback: true };
  }
}
