// src/components/Purchase.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Purchase() {
  const navigate = useNavigate();

  const BASE =
    "https://ybfzpctey6.execute-api.us-east-2.amazonaws.com/dev/inventory-management";

  const [items, setItems] = useState([]);   // [{id, name, price, qty}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});     // { [itemId]: qty }

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch(`${BASE}/inventory`);

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Inventory: JSON parse error:", e, text);
          setError("Failed to load inventory.");
          return;
        }

        // two possible shapes:
        // 1) { items: [...] }
        // 2) { statusCode, headers, body: "{\"items\":[...]}" }
        let itemsPayload = Array.isArray(data.items) ? data.items : undefined;
        let errorMessage = data.error;

        if (!itemsPayload && data.body) {
          try {
            const inner =
              typeof data.body === "string" ? JSON.parse(data.body) : data.body;
            if (Array.isArray(inner.items)) {
              itemsPayload = inner.items;
            }
            if (inner.error) errorMessage = inner.error;
          } catch (e) {
            console.error("Inventory: inner body JSON parse error:", e, data.body);
          }
        }

        if (errorMessage && !itemsPayload) {
          console.error("Inventory API error:", errorMessage);
          setError("Failed to load inventory.");
          return;
        }

        if (!itemsPayload) {
          console.error("Inventory: items not found in response:", data);
          setError("Failed to load inventory.");
          return;
        }

        const normalized = itemsPayload.map((it) => ({
          ...it,
          qty: it.qty ?? it.availableQty ?? 0,
        }));

        setItems(normalized);
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setError("Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const handleQuantityChange = (itemId, quantity) => {
    const qtyNum = Math.max(0, parseInt(quantity || 0, 10));

    if (qtyNum === 0) {
      const next = { ...cart };
      delete next[itemId];
      setCart(next);
      return;
    }

    const item = items.find((x) => String(x.id) === String(itemId));
    const maxQty = item ? Number(item.qty || 0) : 0;
    const finalQty = Math.min(qtyNum, maxQty);

    setCart((prev) => ({ ...prev, [itemId]: finalQty }));
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find((item) => String(item.id) === String(itemId));
      if (!item) return total;

      const unitPrice = Number(item.price);
      const qty = Number(quantity);
      const lineTotal = unitPrice * qty;

      return total + (Number.isFinite(lineTotal) ? lineTotal : 0);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.keys(cart).length === 0) {
      alert("Please select at least one item!");
      return;
    }

    const cartData = Object.entries(cart)
      .map(([itemId, quantity]) => {
        const item = items.find((x) => String(x.id) === String(itemId));
        return item
          ? {
              id: item.id,
              name: item.name,
              price: item.price,
              category: item.category,
              quantity,
            }
          : null;
      })
      .filter(Boolean);

    const total = calculateTotal();

    localStorage.setItem("shoppingCart", JSON.stringify(cartData));
    localStorage.setItem("totalAmount", total);

    navigate("/purchase/paymentEntry", {
      state: {
        cart: cartData,
        total,
        timestamp: new Date().toISOString(),
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <h1>Product Selection</h1>
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <h1>Product Selection</h1>
        <p style={{ color: "crimson" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Product Selection</h1>
      <p>Please select the products and quantities you want to purchase:</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "30px" }}>
          {items.map((item) => {
            const itemId = String(item.id);
            const inStock = Number(item.qty || 0);
            const selected = Number(cart[itemId] || 0);

            return (
              <div
                key={itemId}
                style={{
                  border: "2px solid #e9ecef",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  transition: "border-color 0.2s ease",
                  opacity: inStock > 0 ? 1 : 0.6,
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>
                    {item.name}{" "}
                    <small style={{ color: "#6c757d" }}>(ID: {item.id})</small>
                  </h3>
                  {item.category && (
                    <p style={{ margin: 0, color: "#495057" }}>
                      Category: {item.category}
                    </p>
                  )}
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontWeight: "bold",
                      color: "#e74c3c",
                    }}
                  >
                    ${Number(item.price || 0).toLocaleString()}
                    <span style={{ color: "#6c757d", marginLeft: 10 }}>
                      • {inStock} in stock
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <label htmlFor={`quantity-${itemId}`}>Quantity:</label>
                  <input
                    id={`quantity-${itemId}`}
                    type="number"
                    min="0"
                    max={inStock}
                    value={selected}
                    onChange={(e) =>
                      handleQuantityChange(itemId, e.target.value)
                    }
                    disabled={inStock === 0}
                    style={{
                      width: "70px",
                      padding: "5px",
                      textAlign: "center",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(cart).length > 0 && (
          <div
            style={{
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #dee2e6",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Shopping Cart Summary</h3>
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = items.find(
                (item) => String(item.id) === String(itemId)
              );
              if (!item) return null;

              const unitPrice = Number(item.price);
              const qty = Number(quantity);
              const lineTotal = unitPrice * qty;

              return (
                <div
                  key={itemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>
                    {item.name} x {qty}
                  </span>
                  <span>
                    $
                    {Number.isFinite(lineTotal)
                      ? lineTotal.toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              );
            })}
            <hr />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              <span>Total:</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "14px 35px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 123, 255, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#0056b3")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "#007bff")
            }
          >
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
}

export default Purchase;


