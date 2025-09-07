// src/pages/customer/CustomerOrderDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import nutripawsLogo from "../../assets/nutripawsLogoBase64";
import { getAuth } from "firebase/auth";

function CustomerOrderDetails() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const user = getAuth().currentUser;

  const fetchOrder = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/orders/my/${orderId}`,
        { headers: { Email: user.email } }
      );
      setOrder(res.data);
    } catch (err) {
      toast.error("Failed to fetch order");
      navigate("/customer/orders");
    }
  };

  const exportInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();

    doc.addImage(nutripawsLogo, "PNG", 14, 10, 30, 30);
    doc.setFontSize(20);
    doc.setTextColor(49, 171, 58);
    doc.text("NutriPaws Marketplace", 60, 25);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(14);
    doc.text("Customer Invoice", 14, 50);

    doc.setFontSize(11);
    doc.text(`Order ID: ${order.id}`, 14, 60);
    doc.text(`Buyer: ${order.buyerEmail}`, 14, 68);

    if (order.createdAt) {
      doc.text(
        `Placed: ${new Date(order.createdAt.seconds * 1000).toLocaleString()}`,
        14,
        76
      );
    }
    if (order.shippingAddress) {
      doc.text(`Shipping: ${order.shippingAddress}`, 14, 84);
    }
    if (order.notes) {
      doc.text(`Notes: ${order.notes}`, 14, 92);
    }

    const tableData = order.items.map((item) => [
      item.productName,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`,
    ]);

    doc.autoTable({
      head: [["Product", "Qty", "Price", "Subtotal"]],
      body: tableData,
      startY: order.notes ? 100 : order.shippingAddress ? 92 : 76,
    });

    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.text(`Total: $${order.totalPrice.toFixed(2)}`, 14, finalY + 10);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with NutriPaws!", 14, finalY + 20);

    doc.save(`invoice_${order.id}.pdf`);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (!order) return <p className="p-6">Loading order...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to My Orders
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#31ab3a]">
            Order #{order.id}
          </h2>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              order.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : order.status === "DELIVERED"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p>
              <span className="font-semibold">Buyer:</span> {order.buyerEmail}
            </p>
            <p>
              <span className="font-semibold">Total:</span> $
              {order.totalPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Shipping:</span>{" "}
              {order.shippingAddress || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Notes:</span>{" "}
              {order.notes || "None"}
            </p>
            <p>
              <span className="font-semibold">Created:</span>{" "}
              {order.createdAt
                ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Items</h3>
        <table className="w-full border text-left mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2 border">{item.productName}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">${item.price.toFixed(2)}</td>
                <td className="p-2 border">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end space-x-2">
          <button
            onClick={exportInvoice}
            className="px-4 py-2 bg-[#fe9f23] hover:bg-orange-600 text-white rounded"
          >
            Export Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerOrderDetails;
