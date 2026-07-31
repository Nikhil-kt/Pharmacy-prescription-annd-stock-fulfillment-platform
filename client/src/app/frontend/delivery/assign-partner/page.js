"use client";

import { useState, useEffect } from "react";

export default function AssignPartnerPage() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);

  // Form State: Add Partner
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  // Form State: Assignment
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load dropdown data from backend
  const fetchData = async () => {
    try {
      const resOrders = await fetch("http://localhost:5000/api/delivery/prescriptions/unassigned");
      const dataOrders = await resOrders.json();
      if (dataOrders.success && Array.isArray(dataOrders.prescriptions)) {
        setOrders(dataOrders.prescriptions);
      }

      const resPartners = await fetch("http://localhost:5000/api/delivery/partners");
      const dataPartners = await resPartners.json();
      if (dataPartners.success && Array.isArray(dataPartners.partners)) {
        setPartners(dataPartners.partners);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Dynamic Add Partner Handler
  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerName || !partnerPhone) {
      alert("Please enter partner name and phone number");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/delivery/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName,
          phone: partnerPhone,
          status: "available",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Added Partner: ${partnerName}`);
        setPartnerName("");
        setPartnerPhone("");
        fetchData(); // Refresh list immediately!
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Network Error: ${err.message}`);
    }
  };

  // 2. Assignment Submission Handler
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedPartner) {
      alert("Please select both an order and a delivery partner.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/delivery/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder,
          delivery_partner_id: selectedPartner,
          notes: notes,
          status: "ASSIGNED",
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage("✅ Delivery assigned successfully!");
        setSelectedOrder("");
        setSelectedPartner("");
        setNotes("");
        fetchData(); // Refresh list
      } else {
        setMessage(`❌ Assignment failed: ${result.error}`);
      }
    } catch (err) {
      setMessage(`❌ Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Dynamic Add Partner Section */}
      <div className="p-6 bg-gray-50 border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Partner</h2>
        <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Partner Name"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="border p-2 rounded-lg text-sm"
          />
          <input
    type="email"
    placeholder="Email Address"
    value={partnerEmail}
    onChange={(e) => setPartnerEmail(e.target.value)}
    className="border p-2 rounded-lg text-sm"
  />
          <input
            type="text"
            placeholder="Phone Number"
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(e.target.value)}
            className="border p-2 rounded-lg text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            + Add Partner
          </button>
        </form>
      </div>

      {/* Main Assignment Section */}
      <div className="p-6 bg-white border rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-2">Assign Delivery Partner</h1>
        <p className="text-gray-500 mb-6 text-sm">Select order and partner from dropdowns.</p>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-800 text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Prescription/Order</label>
            <select
  value={selectedOrder}
  onChange={(e) => setSelectedOrder(e.target.value)}
  className="w-full border p-2 rounded-lg text-sm bg-white"
>
  <option value="">-- Choose Order --</option>
  {Array.isArray(orders) && orders.length > 0 ? (
    orders.map((ord) => (
      <option key={ord.id} value={ord.id}>
        Prescription #{ord.id ? ord.id.slice(0, 8) : "N/A"} 
        {ord.patient_name ? ` - ${ord.patient_name}` : ""}
        {ord.status ? ` [${ord.status}]` : ""}
      </option>
    ))
  ) : (
    <option disabled>No unassigned orders found</option>
  )}
</select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Delivery Partner</label>
            <select
  value={selectedPartner}
  onChange={(e) => setSelectedPartner(e.target.value)}
  className="w-full border p-2 rounded-lg text-sm bg-white"
>
  <option value="">-- Choose Partner --</option>
  {Array.isArray(partners) && partners.length > 0 ? (
    partners.map((partner) => (
      <option key={partner.id} value={partner.id}>
        {/* Fallbacks check for name, full_name, or partner_name */}
        {partner.name || partner.full_name || partner.partner_name || `Partner #${partner.id}`}
        {partner.phone ? ` (${partner.phone})` : ""}
      </option>
    ))
  ) : (
    <option disabled>No partners available. Add one above!</option>
  )}
</select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Call before delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border p-2 rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? "Assigning..." : "Confirm Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}