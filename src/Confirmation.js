import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Order data state
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  
  const CONFIRMATION_NUMBER = "EC234234";

  // Get order data
  useEffect(() => {
    // Get order data
    const savedOrder = localStorage.getItem('currentOrder');
    
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    }

    if (location.state && location.state.order) {
      console.log('Confirmation - Order data:', location.state.order);
      setOrderData(location.state.order);
    }
    
    setIsLoading(false);
  }, [location]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  // Start new shopping
  const handleNewOrder = () => {
    // Clear all order-related localStorage data
    localStorage.removeItem('shoppingCart');
    localStorage.removeItem('totalAmount');
    localStorage.removeItem('paymentInfo');
    localStorage.removeItem('shippingInfo');
    localStorage.removeItem('currentOrder');
    navigate('/purchase');
  };

  // Print order (simple window print function)
  const handlePrintOrder = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Processing...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center',
        border: '2px solid #28a745',
        borderRadius: '10px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
                <h1 style={{ 
          color: '#28a745', 
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '32px'
        }}>
          Order Confirmed Successfully!
        </h1>
                <p style={{ 
          textAlign: 'center', 
          color: '#495057', 
          fontSize: '18px',
          marginBottom: '30px' 
        }}>
          Thank you for your purchase, we have received your order
        </p>
      </div>

      {/* Confirmation Number Section */}
      <div style={{ 
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '25px',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
                <h2 style={{
          textAlign: 'center',
          color: '#dc3545',
          margin: '0 0 15px 0',
          fontSize: '20px'
        }}>
          📋 Order Confirmation Number
        </h2>
        <div style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#dc3545',
          padding: '15px',
          borderRadius: '5px',
          border: '2px dashed #dc3545',
          letterSpacing: '2px',
          fontFamily: 'monospace'
        }}>
          {CONFIRMATION_NUMBER}
        </div>
        <p style={{ 
          fontSize: '14px',
          color: '#856404',
          margin: '15px 0 0 0'
        }}>
          Please keep this confirmation number safe for order tracking
        </p>
      </div>

      {/* Order Summary */}
      {orderData && (
        <div style={{ 
          border: '2px solid #e9ecef',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 3px 10px rgba(0,0,0,0.12)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            color: '#aaaaaaff',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px'
          }}>
            📦 Order Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Order Number:</strong> {orderData.orderNumber}
              </p>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Order Date:</strong> {formatDate(orderData.orderDate)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Order Status:</strong> 
                <span style={{ 
                  color: '#28a745', 
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  marginLeft: '8px'
                }}>
                  Confirmed
                </span>
              </p>
              <p style={{ margin: '0' }}>
                <strong>Estimated Shipping:</strong> 1-2 business days
              </p>
            </div>
          </div>

          {/* Product List */}
          <h4 style={{ margin: '20px 0 10px 0', color: '#c2c2c2ff' }}>Ordered Items:</h4>
          {orderData.items && orderData.items.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #eee',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              <div>
                <strong>{item.name}</strong>
                <div style={{ fontSize: '14px', color: '#acacacff' }}>
                  ${item.price.toLocaleString()} × {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                NT$ {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}

          {/* Price Details */}
          <div style={{ 
            marginTop: '20px',
            paddingTop: '15px',
            borderTop: '2px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span>NT$ {orderData.subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Shipping:</span>
              <span>{orderData.shippingFee === 0 ? 'Free' : `$${orderData.shippingFee}`}</span>
            </div>
            <hr />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#e74c3c'
            }}>
              <span>Total Amount:</span>
              <span>US$ {orderData.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={handlePrintOrder}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            padding: '12px 25px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
        >
          🖨️ Print Order
        </button>

        <button 
          onClick={handleNewOrder}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '14px 30px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(40, 167, 69, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          🛒 Continue Shopping
        </button>
      </div>

      
    </div>
  );
}

export default Confirmation;
