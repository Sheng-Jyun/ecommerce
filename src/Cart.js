import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedOrders, setSavedOrders] = useState([]); // list of previously saved orders

  useEffect(() => {
    // Prefer navigation state when coming from add-to-cart
    if (location.state && Array.isArray(location.state.cart)) {
      const incoming = location.state.cart;
      const incomingTotal = incoming.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity || 1), 0);
      setCartData(incoming);
      setTotalAmount(incomingTotal);
      localStorage.setItem('shoppingCart', JSON.stringify(incoming));
      localStorage.setItem('totalAmount', String(incomingTotal));
    } else {
      // Otherwise load from localStorage; if empty, show empty cart
      const savedCart = localStorage.getItem('shoppingCart');
      const savedTotal = localStorage.getItem('totalAmount');
      if (savedCart) setCartData(JSON.parse(savedCart));
      if (savedTotal) setTotalAmount(Number(savedTotal));
    }
  }, []);

  const handleGoToPayment = () => {
    if (!cartData || cartData.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    navigate('/purchase/paymentEntry', {
      state: {
        cart: cartData,
        total: totalAmount,
        from: 'cart'
      }
    });
  };

  const saveCurrentAsOrder = () => {
    if (!cartData || cartData.length === 0) {
      alert('No items in cart to save.');
      return;
    }
    const order = {
      id: 'ORD-' + Date.now(),
      createdAt: new Date().toISOString(),
      items: cartData,
      total: totalAmount,
    };
    const next = [order, ...savedOrders].slice(0, 50); // keep up to 50
    setSavedOrders(next);
    localStorage.setItem('savedOrders', JSON.stringify(next));
  };

  const removeItem = (id) => {
    const next = cartData.filter(item => String(item.id) !== String(id));
    const nextTotal = next.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
    setCartData(next);
    setTotalAmount(nextTotal);
    localStorage.setItem('shoppingCart', JSON.stringify(next));
    localStorage.setItem('totalAmount', String(nextTotal));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Your Cart</h1>
      {cartData.length === 0 ? (
        <p style={{ color: '#495057' }}>Cart is empty. Go to Templates to add items.</p>
      ) : (
        <div style={{
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {cartData.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #eee'
            }}>
              <div>
                <strong>{item.name}</strong>
                {item.category && (
                  <div style={{ color: '#6c757d' }}>Category: {item.category}</div>
                )}
                <div style={{ color: '#495057' }}>
                  ${Number(item.price).toLocaleString()} × {Number(item.quantity)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                  ${ (Number(item.price) * Number(item.quantity)).toLocaleString() }
                </div>
                <button onClick={() => removeItem(item.id)} style={{
                  marginTop: '6px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  cursor: 'pointer'
                }}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span style={{ color: '#28a745' }}>${Number(totalAmount).toLocaleString()}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
        <button onClick={() => navigate('/purchase')} style={{
          backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer'
        }}>Back to Products</button>
        {/*<button onClick={saveCurrentAsOrder} style={{
          backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer'
        }}>Save as Order</button>*/}
        <button onClick={handleGoToPayment} style={{
          backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer'
        }}>Go to Payment</button>
      </div>

      {/* Saved Orders List */}
      <div style={{ marginTop: '30px' }}>
        <h2>Saved Orders</h2>
        {savedOrders.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No saved orders yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {savedOrders.map(order => (
              <div key={order.id} style={{
                border: '1px solid #dee2e6', borderRadius: '8px', padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{order.id}</strong>
                  <span style={{ color: '#6c757d' }}>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ color: '#495057', marginBottom: '8px' }}>
                  {order.items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.name} × {Number(it.quantity)}</span>
                      <span>${(Number(it.price) * Number(it.quantity)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: '#28a745' }}>${Number(order.total).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => {
                    // Load this order into current cart
                    setCartData(order.items);
                    setTotalAmount(order.total);
                    localStorage.setItem('shoppingCart', JSON.stringify(order.items));
                    localStorage.setItem('totalAmount', String(order.total));
                  }} style={{
                    backgroundColor: '#20c997', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer'
                  }}>Load to Cart</button>
                  <button onClick={() => {
                    // Proceed to payment with this order
                    navigate('/purchase/paymentEntry', {
                      state: { cart: order.items, total: order.total, from: 'saved-order', orderId: order.id }
                    });
                  }} style={{
                    backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer'
                  }}>Pay This Order</button>
                </div>
              </div>
            ))}
            <button onClick={() => { localStorage.removeItem('savedOrders'); setSavedOrders([]); }} style={{
              backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer'
            }}>Clear All Saved Orders</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
