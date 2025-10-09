import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ViewOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Order related data
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [shippingInfo, setShippingInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Get all data
  useEffect(() => {
    // Get data
    const savedCart = localStorage.getItem('shoppingCart');
    const savedTotal = localStorage.getItem('totalAmount');
    const savedPayment = localStorage.getItem('paymentInfo');
    const savedShipping = localStorage.getItem('shippingInfo');
    
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
    
    if (savedTotal) {
      setTotalAmount(parseInt(savedTotal));
    }

    if (savedPayment) {
      setPaymentInfo(JSON.parse(savedPayment));
    }

    if (savedShipping) {
      setShippingInfo(JSON.parse(savedShipping));
    }

    // Get data
    if (location.state) {
      console.log('ViewOrder - Location state data:', location.state);
      
      if (location.state.cart) {
        setCartData(location.state.cart);
      }
      if (location.state.total) {
        setTotalAmount(location.state.total);
      }
      if (location.state.payment) {
        setPaymentInfo(location.state.payment);
      }
      if (location.state.shipping) {
        setShippingInfo(location.state.shipping);
      }
    }
    
    setIsLoading(false);
  }, [location]);

  //masked card number
  const maskedCardNumber = (() => {
    const original = paymentInfo?.cardNumber ?? '';
    const cleanNumber = String(original).replace(/\s/g, '');
    if (cleanNumber.length >= 4) {
      return `**** **** **** ${cleanNumber.slice(-4)}`;
    }
    return original;
  })();

  // Calculate shipping
  const calculateShippingFee = () => {
    return totalAmount >= 1000 ? 0 : 60;
  };

  // Calculate final total amount
  const calculateFinalTotal = () => {
    return totalAmount + calculateShippingFee();
  };

  // Confirm order
  const handleConfirmOrder = () => {
    // Generate order number
    const orderNumber = 'ORD' + Date.now();
    const orderData = {
      orderNumber,
      items: cartData,
      subtotal: totalAmount,
      shippingFee: calculateShippingFee(),
      total: calculateFinalTotal(),
      payment: paymentInfo,
      shipping: shippingInfo,
      orderDate: new Date().toISOString(),
      status: 'confirmed'
    };

    // Save complete order data
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    // Navigate to confirmation page
    navigate('/purchase/viewConfirmation', {
      state: {
        order: orderData
      }
    });
  };

  // Return to shipping information page
  const handleBack = () => {
    navigate('/purchase/shippingEntry', {
      state: {
        cart: cartData,
        total: totalAmount,
        payment: paymentInfo
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Order Review</h1>
      <p style={{ color: '#495057', marginBottom: '30px' }}>
        Please carefully review your order information. Confirm all details are correct before submitting your order.
      </p>
      
      {/* Product List */}
      <div style={{ 
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '25px', 
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: '0', color: '#efefefff', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
          📦 Ordered Items
        </h3>
        {cartData.length > 0 ? (
          <>
            {cartData.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#d1c7c7ff' }}>{item.name}</h4>
                  <p style={{ margin: '0', color: '#bdbebfff', fontSize: '14px' }}>
                    Category: {item.category}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#a9acafff' }}>
                    Price: ${item.price.toLocaleString()}
                  </p>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  minWidth: '80px',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Quantity: {item.quantity}
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'right', 
                  minWidth: '120px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#e74c3c'
                }}>
                  NT$ {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            
            {/* Price Details */}
            <div style={{ 
              marginTop: '20px', 
              paddingTop: '20px', 
              borderTop: '2px solid #dee2e6' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Subtotal:</span>
                <span style={{ fontWeight: 'bold', color: '#28a745' }}>${totalAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Shipping:</span>
                <span style={{ color: calculateShippingFee() === 0 ? '#28a745' : '#333' }}>
                  {calculateShippingFee() === 0 ? 'Free' : `$${calculateShippingFee()}`}
                </span>
              </div>
              
              <hr />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#e74c3c'
              }}>
                <span>Total Amount:</span>
                <span>US$ {calculateFinalTotal().toLocaleString()}</span>
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: '#495057' }}>No product information found</p>
        )}
      </div>

      {/* Payment Information */}
      <div style={{ 
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '25px', 
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: '0', color: '#fafafaff', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>
          💳 Payment Information
        </h3>
        {Object.keys(paymentInfo).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Payment Method:</strong> {paymentInfo.paymentMethod === 'credit' ? 'Credit Card' : 'Debit Card'}
              </p>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Cardholder Name:</strong> {paymentInfo.cardHolder}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Card Number:</strong> {maskedCardNumber}
              </p>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Expiry Date:</strong> {paymentInfo.expiryDate}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: '#495057' }}>No payment information found</p>
        )}
      </div>

      {/* Shipping Information */}
      <div style={{  
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '25px', 
        marginBottom: '35px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: '0', color: '#dbd7d7ff', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>
          🚚 Shipping Information
        </h3>
        {Object.keys(shippingInfo).length > 0 ? (
          <div>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Recipient:</strong> {shippingInfo.name}
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Address:</strong> 
              <br />
              ({shippingInfo.zip}) {shippingInfo.state} {shippingInfo.city}
              <br />
              {shippingInfo.addressLine1}
              {shippingInfo.addressLine2 && (
                <>
                  <br />
                  {shippingInfo.addressLine2}
                </>
              )}
            </p>
          </div>
        ) : (
          <p style={{ color: '#495057' }}>No shipping information found</p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        paddingTop: '20px',
        borderTop: '2px solid #dee2e6'
      }}>
        <button 
          type="button"
          onClick={handleBack}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            padding: '15px 40px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          Back to Edit
        </button>
        
        <button 
          type="button"
          onClick={handleConfirmOrder}
          disabled={cartData.length === 0 || Object.keys(paymentInfo).length === 0 || Object.keys(shippingInfo).length === 0}
          style={{
            backgroundColor: cartData.length === 0 || Object.keys(paymentInfo).length === 0 || Object.keys(shippingInfo).length === 0 
              ? '#ccc' : '#dc3545',
            color: 'white',
            padding: '16px 45px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: cartData.length === 0 || Object.keys(paymentInfo).length === 0 || Object.keys(shippingInfo).length === 0 
              ? 'not-allowed' : 'pointer',
            boxShadow: cartData.length === 0 || Object.keys(paymentInfo).length === 0 || Object.keys(shippingInfo).length === 0 
              ? 'none' : '0 3px 8px rgba(220, 53, 69, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (e.target.style.backgroundColor !== 'rgb(204, 204, 204)') {
              e.target.style.backgroundColor = '#c82333';
            }
          }}
          onMouseOut={(e) => {
            if (e.target.style.backgroundColor !== 'rgb(204, 204, 204)') {
              e.target.style.backgroundColor = '#dc3545';
            }
          }}
        >
          Confirm Order
        </button>
      </div>

    </div>
  );
}

export default ViewOrder;