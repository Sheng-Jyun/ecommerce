import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ShippingEntry() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data from previous page
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState({});

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
    // Get data
    const savedCart = localStorage.getItem('shoppingCart');
    const savedTotal = localStorage.getItem('totalAmount');
    const savedPayment = localStorage.getItem('paymentInfo');
    
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
    
    if (savedTotal) {
      setTotalAmount(parseInt(savedTotal));
    }

    if (savedPayment) {
      setPaymentInfo(JSON.parse(savedPayment));
    }

    // Get data
    if (location.state) {
      console.log('Shipping page - Location state data:', location.state);
      
      if (location.state.cart) {
        setCartData(location.state.cart);
      }
      if (location.state.total) {
        setTotalAmount(location.state.total);
      }
      if (location.state.payment) {
        setPaymentInfo(location.state.payment);
      }
    }
  }, [location]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ZIP code format
  const validateZip = (zip) => {
    const zipPattern = /^\d{5}$/;
    return zipPattern.test(zip);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    const requiredFields = ['name', 'addressLine1', 'city', 'state', 'zip'];
    const emptyFields = requiredFields.filter(field => !shippingForm[field].trim());
    
    if (emptyFields.length > 0) {
      alert(`Please fill in the following required fields: ${emptyFields.map(field => {
        const fieldNames = {
          name: 'Recipient Name',
          addressLine1: 'Address Line 1',
          city: 'City',
          state: 'State',
          zip: 'ZIP Code'
        };
        return fieldNames[field];
      }).join(', ')}`);
      return;
    }

    // Validate ZIP code format
    if (!validateZip(shippingForm.zip)) {
      alert('Invalid ZIP code format. Please enter a 5-digit ZIP code.');
      return;
    }

    // Save shipping info
    localStorage.setItem('shippingInfo', JSON.stringify(shippingForm));
    
    // Navigate to order confirmation page
    navigate('/purchase/viewOrder', {
      state: {
        cart: cartData,
        total: totalAmount,
        payment: paymentInfo,
        shipping: shippingForm
      }
    });
  };

  // Return to payment page
  const handleBack = () => {
    navigate('/purchase/paymentEntry', {
      state: {
        cart: cartData,
        total: totalAmount
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Shipping Information</h1>
      
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
                <strong>{item.name}</strong>
                <br />
                <small style={{ color: '#495057' }}>
                  ${item.price.toLocaleString()} × {item.quantity}
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>${(item.price * item.quantity).toLocaleString()}</strong>
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
            <span style={{ color: '#e74c3c' }}>${totalAmount.toLocaleString()}</span>
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

          <div style={{ marginBottom: '20px' }}>
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
                width: '200px',
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
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShippingEntry;