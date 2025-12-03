import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
// import Purchase from './purchase';
import PaymentEntry from './paymentEntry';
import ShippingEntry from './shippingEntry';
import ViewOrder from './viewOrder';
import Confirmation from './Confirmation';
import About from './About';
import Cart from './Cart';
import ChatBot from './ChatBot';
import Templates from './Templates';
import CategoryTemplates from './CategoryTemplates';
import React, { useState } from 'react';

function TopNavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="top-nav">
      <div className="top-nav__brand">
        <Link to="/templates" className="top-nav__logo">JRJ Web re-inventer</Link>
      </div>
      <ul className="top-nav__links">
        <li>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
        </li>
        <li>
          <Link to="/templates" className={isActive('/templates') ? 'active' : ''}>Templates</Link>
        </li>
        {/* Products link removed: selling templates only */}
        {/*<li>
          <Link to="/purchase/paymentEntry" className={isActive('/purchase/paymentEntry') ? 'active' : ''}>Payment</Link>
        </li>
        <li>
          <Link to="/confirmation" className={isActive('/confirmation') ? 'active' : ''}>Confirmation</Link>
        </li>
        <li>
          <Link to="/purchase/shippingEntry" className={isActive('/purchase/shippingEntry') ? 'active' : ''}>Shipping</Link>
        </li>*/}
        <li>
          <Link to="/cart" className={isActive('/cart') ? 'active' : ''}>Cart</Link>
        </li>
        
        <li>
          <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>ChatBot</Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <Router>
      <div className="App">
        <TopNavBar />
        <Routes>
          <Route path="/about" element={<About />} />
          {/* Products route removed; redirect root to templates */}
          <Route path="/" element={<Navigate replace to="/templates" />} />
          <Route path='/purchase/viewOrder' element={<ViewOrder/>} />
          <Route path='/purchase/paymentEntry' element={<PaymentEntry/>} />
          <Route path='/purchase/shippingEntry' element={<ShippingEntry/>} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/:category" element={<CategoryTemplates />} />
        </Routes>

        {/* Floating Chat widget trigger */}
        <button
          className={`chat-widget-button`}
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>

        {/* Chat panel overlay */}
        {chatOpen && (
          <div className="chat-widget-overlay" onClick={() => setChatOpen(false)}>
            <div className="chat-widget-panel" onClick={(e) => e.stopPropagation()}>
              <div className="chat-widget-header">
                <span>Shopping Assistant</span>
                <button className="chat-widget-close" onClick={() => setChatOpen(false)} aria-label="Close chat">✕</button>
              </div>
              <div className="chat-widget-body">
                <ChatBot />
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
