import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChatBot() {
  const navigate = useNavigate();

  const INVENTORY_BASE =
    "https://ybfzpctey6.execute-api.us-east-2.amazonaws.com/dev/inventory-management";
  const CHAT_BASE =
    "https://ybfzpctey6.execute-api.us-east-2.amazonaws.com/dev/chatbot";

  const [items, setItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! Ask me about this season’s styles or how to match outfits. I’ll recommend products.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // ====== 抓 inventory ======
  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch(`${INVENTORY_BASE}/inventory`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setInventoryError("Failed to load inventory");
          setLoadingInventory(false);
          return;
        }
        let itemsPayload = Array.isArray(data.items) ? data.items : undefined;
        if (!itemsPayload && data.body) {
          try {
            const inner =
              typeof data.body === "string"
                ? JSON.parse(data.body)
                : data.body;
            if (Array.isArray(inner.items)) itemsPayload = inner.items;
          } catch {}
        }
        if (!itemsPayload) {
          setInventoryError("Failed to load inventory");
        } else {
          const normalized = itemsPayload.map((it) => ({
            ...it,
            qty: it.qty ?? it.availableQty ?? 0,
            name: String(it.name || ""),
            category: it.category,
            price: Number(it.price || 0),
          }));
          setItems(normalized);
        }
      } catch (e) {
        console.error(e);
        setInventoryError("Failed to load inventory");
      } finally {
        setLoadingInventory(false);
      }
    }
    fetchInventory();
  }, []);

  const index = useMemo(() => {
    return items.map((it) => ({
      ...it,
      tokens: `${(it.name || "").toLowerCase()} ${(it.category || "").toLowerCase()}`,
    }));
  }, [items]);

  // ====== 呼叫後端 /chatbot (OpenAI) ======
  // ====== 呼叫後端 /chatbot (OpenAI) ======
  async function callChatAPI(newMessages) {
    // 轉成 OpenAI 格式：user / assistant
    const payloadMessages = newMessages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text,
    }));

    // ⬅️ 先建好 payloadMessages，再印出來
    console.log(
      "SENDING TO LAMBDA:",
      JSON.stringify({ messages: payloadMessages }, null, 2)
    );

    try {
      const res = await fetch(CHAT_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const raw = await res.text();
      console.log("CHAT RAW STATUS:", res.status);
      console.log("CHAT RAW BODY:", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse outer JSON:", err);
        // 後端如果回的不是 JSON，就直接把 raw 顯示出來
        return raw || "Sorry, I could not respond just now.";
      }

      // data 可能是：
      // { statusCode: 200, headers: {...}, body: "{\"reply\":\"...\"}" }
      // 或未來改成 { reply: "..." }

      // 情況 1：直接有 reply
      if (data.reply) {
        return data.reply;
      }

      // 情況 2：reply 包在 body 裡
      if (data.body) {
        try {
          const inner =
            typeof data.body === "string"
              ? JSON.parse(data.body)
              : data.body;
          if (inner && inner.reply) {
            return inner.reply;
          }
        } catch (err) {
          console.error("Failed to parse inner body:", err);
        }
      }

      // 其他 fallback
      return "Sorry, I got no reply.";
    } catch (err) {
      console.error("callChatAPI error:", err);
      return "Sorry, the chat service is temporarily unavailable.";
    }
  }


  async function handleSend() {
    const text = input.trim();
    if (!text || chatLoading) return;

    setChatError(null);

    // 1. 先把 user 訊息加進 state
    const newUserMessage = { role: "user", text };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");

    // 2. 呼叫後端（這版 callChatAPI 不會 throw，只會回字串）
    setChatLoading(true);
    const reply = await callChatAPI(newMessages);
    const botMessage = { role: "bot", text: reply };
    setMessages((prev) => [...prev, botMessage]);
    setChatLoading(false);
  }

  function addToCart(item) {
    const savedCart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    const existing = savedCart.find((x) => String(x.id) === String(item.id));
    if (existing) {
      existing.quantity = Number(existing.quantity || 0) + 1;
    } else {
      savedCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        quantity: 1,
      });
    }
    const total = savedCart.reduce(
      (sum, it) => sum + Number(it.price) * Number(it.quantity),
      0
    );
    localStorage.setItem("shoppingCart", JSON.stringify(savedCart));
    localStorage.setItem("totalAmount", String(total));
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: `Added ${item.name} to cart. Total: $${total.toLocaleString()}`,
      },
    ]);
  }

  // ====== Render ======

  if (loadingInventory) {
    return <div style={{ padding: 20 }}>Loading inventory & ChatBot...</div>;
  }
  if (inventoryError) {
    return (
      <div style={{ padding: 20, color: "crimson" }}>{inventoryError}</div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Shopping Assistant</h1>
      <p style={{ color: "#495057" }}>
        Ask about seasonal styles or your outfit ideas, and I’ll recommend
        items. Try: “summer t-shirt”, “warm jacket”, “formal shirt”.
      </p>

      <div
        style={{
          border: "1px solid #dee2e6",
          borderRadius: 8,
          padding: 16,
          minHeight: 200,
          background: "#fff",
          maxHeight: 350,
          overflowY: "auto",
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: m.role === "bot" ? "bold" : "normal" }}>
              {m.role === "bot" ? "Assistant" : "You"}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {chatLoading && (
          <div style={{ marginTop: 8, fontStyle: "italic", color: "#6c757d" }}>
            Assistant is thinking...
          </div>
        )}
        {chatError && (
          <div style={{ marginTop: 8, color: "crimson" }}>{chatError}</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type your question..."
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
        <button
          onClick={() => navigate("/cart")}
          style={{
            backgroundColor: "#20c997",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Go to Cart
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Popular Picks</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {index.slice(0, 5).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #eee",
                borderRadius: 6,
                padding: 10,
              }}
            >
              <div>
                <strong>{item.name}</strong>
                {item.category && (
                  <div style={{ color: "#6c757d" }}>
                    Category: {item.category}
                  </div>
                )}
                <div style={{ color: "#495057" }}>
                  $ {item.price.toLocaleString()} •{" "}
                  {Number(item.qty || 0)} in stock
                </div>
              </div>
              <div>
                <button
                  onClick={() => addToCart(item)}
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatBot;

