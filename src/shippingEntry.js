import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ShippingEntry() {
  const location = useLocation();
  const navigate = useNavigate();

  // 你的 API base
  const BASE = 'https://fkw5fubldj.execute-api.us-east-2.amazonaws.com/dev';

  // Data from previous page
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState({});

  // Server state
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null); // {type:'stock'|'generic', details?:[], message?:string}

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: ''
  });

  // Ohio cities list
  const ohioCities = [
    'Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Mansfield', 'Dublin'
  ];

  // Load data
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    const savedTotal = localStorage.getItem('totalAmount');
    const savedPayment = localStorage.getItem('paymentInfo');

    if (savedCart) setCartData(JSON.parse(savedCart));
    if (savedTotal) setTotalAmount(parseInt(savedTotal));
    if (savedPayment) setPaymentInfo(JSON.parse(savedPayment));

    if (location.state) {
      if (location.state.cart) setCartData(location.state.cart);
      if (location.state.total) setTotalAmount(location.state.total);
      if (location.state.payment) setPaymentInfo(location.state.payment);
    }
  }, [location]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  // ZIP code format
  const validateZip = (zip) => /^\d{5}$/.test(zip);

  // ---- 呼叫後端下單 ----
  async function placeOrder() {
    // 組裝 items
    const itemsPayload = cartData.map(x => ({
      id: String(x.id),
      qty: Number(x.quantity || x.qty || 0)
    }));

    // 組裝 payment（只傳 method/last4，避免把卡資料送到後端）
    const payment = {
      method: paymentInfo.paymentMethod || 'card',
      last4: (paymentInfo.cardNumber || '').replace(/\s/g, '').slice(-4)
    };

    // 組裝 shipping
    const shipping = {
      name: shippingForm.name,
      address: [
        shippingForm.addressLine1,
        shippingForm.addressLine2,
        `${shippingForm.city}, ${shippingForm.state} ${shippingForm.zip}`
      ].filter(Boolean).join(', ')
    };

    const res = await fetch(`${BASE}/order_process/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsPayload, payment, shipping })
    });

    // 兼容非-proxy 回傳
    let data = {};
    try {
      const raw = await res.json();
      data = raw?.confirmation || raw?.error || raw?.items
        ? raw
        : (typeof raw?.body === 'string' ? JSON.parse(raw.body) : raw);
    } catch (_) { /* ignore */ }

    if (res.status === 201 || data?.confirmation) {
      // 清空暫存
      localStorage.removeItem('shoppingCart');
      localStorage.removeItem('totalAmount');
      localStorage.removeItem('shippingInfo');
      // 前往確認頁
      navigate('/confirmation', { state: { confirmation: data.confirmation } });
      return;
    }

    if (res.status === 409 || data?.error === 'insufficient_inventory') {
      setServerError({ type: 'stock', details: data.details || [] });
      return;
    }

    setServerError({ type: 'generic', message: data?.error || `HTTP ${res.status}` });
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const requiredFields = ['name', 'addressLine1', 'city', 'state', 'zip'];
    const emptyFields = requiredFields.filter(f => !String(shippingForm[f] || '').trim());

    if (emptyFields.length > 0) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!validateZip(shippingForm.zip)) {
      alert('Invalid ZIP code format. Please enter a 5-digit ZIP code.');
      return;
    }
    if (cartData.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    // Save shipping info (可留作返回時回填)
    localStorage.setItem('shippingInfo', JSON.stringify(shippingForm));

    setSubmitting(true);
    try {
      await placeOrder();
    } catch (err) {
      setServerError({ type: 'generic', message: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  // Return to payment page
  const handleBack = () => {
    navigate('/purchase/paymentEntry', {
      state: { cart: cartData, total: totalAmount, payment: paymentInfo }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Shipping Information</h1>

      {/* 錯誤訊息區 */}
      {serverError?.type === 'stock' && (
        <div style={{ background: '#fff3cd', padding: 12, borderRadius: 6, marginBottom: 12 }}>
          <strong>Some items are not available in requested quantity:</strong>
          <ul>
            {serverError.details.map(d => (
              <li key={d.id}>
                ID {d.id}: requested {d.requested}, available {d.available ?? 0}
              </li>
            ))}
          </ul>
          <p>Please go back and reduce the quantities.</p>
        </div>
      )}
      {serverError?.type === 'generic' && (
        <div style={{ background: '#f8d7da', padding: 12, borderRadius: 6, marginBottom: 12 }}>
          {serverError.message}
        </div>
      )}

      {/* Order Summary */}
      {cartData.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Order Summary</h3>
          {cartData.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #dee2e6'
            }}>
              <div>
                <strong>{item.name}</strong><br />
                <small style={{ color: '#495057' }}>
                  ${Number(item.price).toLocaleString()} × {item.quantity}
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>${(Number(item.price) * Number(item.quantity)).toLocaleString()}</strong>
              </div>
            </div>
          ))}
          <hr />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            <span>Total:</span>
            <span style={{ color: '#e74c3c' }}>${Number(totalAmount).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Shipping Information Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <h3>Recipient Information</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={shippingForm.name}
              onChange={handleInputChange}
              placeholder="Enter recipient's full name"
              required
              style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                State *
              </label>
              <select
                name="state"
                value={shippingForm.state}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              >
                <option value="">Select State</option>
                <option value="Ohio">Ohio</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                City *
              </label>
              <select
                name="city"
                value={shippingForm.city}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              >
                <option value="">Select City</option>
                {ohioCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Address Line 1 *
            </label>
            <input
              type="text"
              name="addressLine1"
              value={shippingForm.addressLine1}
              onChange={handleInputChange}
              placeholder="Street address, P.O. box, company name, c/o"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              value={shippingForm.addressLine2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, unit, building, floor, etc. (Optional)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                ZIP Code *
              </label>
              <input
                type="text"
                name="zip"
                value={shippingForm.zip}
                onChange={handleInputChange}
                placeholder="e.g., 43215"
                maxLength="5"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#495057' }}>
                Please enter a 5-digit ZIP code
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Address Preview
              </label>
              <div style={{
                padding: '10px',
                border: '1px dashed #ced4da',
                borderRadius: '4px',
                minHeight: '42px',
                color: '#495057'
              }}>
                {[shippingForm.addressLine1, shippingForm.addressLine2,
                  shippingForm.city && `${shippingForm.city}, ${shippingForm.state} ${shippingForm.zip}`]
                  .filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '12px 30px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back to Payment
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              padding: '14px 35px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(23, 162, 184, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShippingEntry;