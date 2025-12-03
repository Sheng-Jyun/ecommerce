import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChatBot() {
  const navigate = useNavigate();

  const CHAT_BASE =
    "https://ybfzpctey6.execute-api.us-east-2.amazonaws.com/dev/chatbot";

  // Local templates catalog for recommendations (for UI only)
  const templateCatalog = [
    { id: "tmpl-fashion-hero", name: "Clothing Store — Modern Apparel", price: 299, category: "clothing-store" },
    { id: "tmpl-electronics-tech", name: "Electronics Store — Tech Hub", price: 349, category: "electronics-store" },
    { id: "tmpl-blog-clean", name: "Personal Blog — Clean Blog", price: 199, category: "personal-blog" },
    { id: "tmpl-gov-portal", name: "Government Site — City Services", price: 499, category: "government-site" },
    { id: "tmpl-food-restaurant", name: "Food & Groceries — Restaurant Classic", price: 279, category: "food-store" },
    { id: "tmpl-furn-showroom", name: "Furniture Store — Showroom Catalog", price: 329, category: "furniture-store" },
  ];

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! I help you pick website templates. Just tell me something like 'restaurant website', 'electronics shop', 'personal blog', 'government portal', or 'furniture store', and I’ll recommend 3–5 templates for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const index = useMemo(() => {
    return templateCatalog.map((it) => ({
      ...it,
      tokens: `${(it.name || "").toLowerCase()} ${(it.category || "").toLowerCase()}`,
    }));
  }, [templateCatalog]);

  async function callChatAPI(newMessages) {
    const payloadMessages = newMessages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text,
    }));

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
        return raw || "Sorry, I could not respond just now.";
      }

      if (data.reply) {
        return data.reply;
      }

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

      return "Sorry, I got no reply.";
    } catch (err) {
      console.error("callChatAPI error:", err);
      return "Sorry, the chat service is temporarily unavailable.";
    }
  }

  async function handleSend(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || chatLoading) return;

    setChatError(null);

    const newUserMessage = { role: "user", text };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");

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

  const quickExamples = [
    "Restaurant website for Chinese food",
    "Electronics shop with product grid",
    "Clean personal blog layout",
    "Accessible government portal",
    "Furniture showroom website",
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Template Assistant</h1>
      <p style={{ color: "#495057" }}>
        Describe the website you want, and I’ll recommend templates. Try things like:
        “restaurant website”, “electronics store”, “clean personal blog”, or “government portal”.
      </p>

      {/* Quick example buttons */}
      <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {quickExamples.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            style={{
              border: "1px solid #ced4da",
              borderRadius: 999,
              padding: "6px 12px",
              background: "#f8f9fa",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {q}
          </button>
        ))}
      </div>

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
          placeholder="Type something like 'restaurant website' or 'clean blog'..."
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
        <button
          onClick={() => handleSend()}
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
        <h3>Popular Templates</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {index.slice(0, 6).map((item) => (
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
                <div style={{ color: "#495057" }}>
                  $ {item.price.toLocaleString()} • Category: {item.category}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
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
                <button
                  onClick={() => navigate(`/templates/${item.category}`)}
                  style={{
                    backgroundColor: "#6f42c1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  View Category
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

