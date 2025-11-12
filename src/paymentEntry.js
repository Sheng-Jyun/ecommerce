import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaymentEntry() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get cart data
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Payment
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvvCode: '',
    cardHolder: '',
    paymentMethod: 'credit'
  });

  // Get cart data
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    const savedTotal = localStorage.getItem('totalAmount');

    if (savedCart) setCartData(JSON.parse(savedCart));
    if (savedTotal) setTotalAmount(parseInt(savedTotal));

    if (location.state) {
      if (location.state.cart) setCartData(location.state.cart);
      if (location.state.total) setTotalAmount(location.state.total);
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  // Format credit card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(' ') : v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentForm(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    setPaymentForm(prev => ({ ...prev, expiryDate: value }));
  };

  // Handle form submission -> 只驗證 & 存 payment，然後到 shipping 頁
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!paymentForm.cardNumber || !paymentForm.expiryDate ||
        !paymentForm.cvvCode || !paymentForm.cardHolder) {
      alert('Please fill in all required fields: card number, expiry date, CVV code, and cardholder name!');
      return;
    }

    const cleanCardNumber = paymentForm.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      alert('Please enter a valid 16-digit credit card number!');
      return;
    }

    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(paymentForm.expiryDate)) {
      alert('Please enter the correct expiry date format (MM/YY)!');
      return;
    }

    if (!/^\d{3,4}$/.test(paymentForm.cvvCode)) {
      alert('Please enter a valid 3-4 digit CVV code!');
      return;
    }

    if (cartData.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    // 存付款資訊（給 shippingEntry 用）
    localStorage.setItem('paymentInfo', JSON.stringify(paymentForm));

    // 前往 shipping 頁
    navigate('/purchase/shippingEntry', {
      state: {
        cart: cartData,
        total: totalAmount,
        payment: paymentForm
      }
    });
  };

  const handleBack = () => {
    navigate('/purchase');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Payment Information</h1>

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

      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <h3>Payment Method</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="credit"
                checked={paymentForm.paymentMethod === 'credit'}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              Credit Card
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="debit"
                checked={paymentForm.paymentMethod === 'debit'}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              Debit Card
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Cardholder Name *
            </label>
            <input
              type="text"
              name="cardHolder"
              value={paymentForm.cardHolder}
              onChange={handleInputChange}
              placeholder="Enter cardholder name"
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

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Card Number *
            </label>
            <input
              type="text"
              name="cardNumber"
              value={paymentForm.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
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

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Expiry Date *
            </label>
            <input
              type="text"
              name="expiryDate"
              value={paymentForm.expiryDate}
              onChange={handleExpiryDateChange}
              placeholder="MM/YY"
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
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              CVV Code *
            </label>
            <input
              type="text"
              name="cvvCode"
              value={paymentForm.cvvCode}
              onChange={handleInputChange}
              placeholder="123"
              maxLength="4"
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
            Back to Shopping
          </button>

          <button
            type="submit"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '14px 35px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            Continue to Shipping
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaymentEntry;