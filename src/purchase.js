import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Purchase() {
  const navigate = useNavigate();
  
  // Product list data
  const [items] = useState([
    { id: 1, name: 'iPhone 15 Pro', price: 999, category: 'Smartphone' },
    { id: 2, name: 'MacBook Air M3', price: 1099, category: 'Laptop' },
    { id: 3, name: 'iPad Pro 12.9"', price: 1099, category: 'Tablet' },
    { id: 4, name: 'AirPods Pro 2', price: 249, category: 'Headphones' },
    { id: 5, name: 'Apple Watch Ultra 2', price: 799, category: 'Smartwatch' }
  ]);

  // Shopping cart state
  const [cart, setCart] = useState({});
  
  // Handle quantity changes
  const handleQuantityChange = (itemId, quantity) => {
    const qty = parseInt(quantity) || 0;
    
    if (qty === 0) {
      // If quantity is 0, remove item from cart
      const newCart = { ...cart };
      delete newCart[itemId];
      setCart(newCart);
    } else {
      // Update item quantity in cart
      setCart(prev => ({
        ...prev,
        [itemId]: qty
      }));
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find(item => item.id === parseInt(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (Object.keys(cart).length === 0) {
      alert('Please select at least one item!');
      return;
    }

    // Save cart data
    const cartData = Object.entries(cart).map(([itemId, quantity]) => {
      const item = items.find(item => item.id === parseInt(itemId));
      return {
        ...item,
        quantity
      };
    });
    
    const total = calculateTotal();
    
    localStorage.setItem('shoppingCart', JSON.stringify(cartData));
    localStorage.setItem('totalAmount', total);
    
    // Navigate to payment page
    navigate('/purchase/paymentEntry', {
      state: {
        cart: cartData,
        total: total,
        timestamp: new Date().toISOString()
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Product Selection</h1>
      <p>Please select the products and quantities you want to purchase:</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '30px' }}>
          {items.map(item => (
            <div key={item.id} style={{ 
              border: '2px solid #e9ecef', 
              padding: '20px', 
              marginBottom: '15px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'border-color 0.2s ease'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                <p style={{ margin: '0', color: '#495057' }}>Category: {item.category}</p>
                <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#e74c3c' }}>
                  ${item.price.toLocaleString()}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="0"
                  max="10"
                  value={cart[item.id] || 0}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  style={{ 
                    width: '60px', 
                    padding: '5px', 
                    textAlign: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '3px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Shopping Cart Summary */}
        {Object.keys(cart).length > 0 && (
          <div style={{  
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #dee2e6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>Shopping Cart Summary</h3>
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = items.find(item => item.id === parseInt(itemId));
              return item ? (
                <div key={itemId} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span>{item.name} x {quantity}</span>
                  <span>${(item.price * quantity).toLocaleString()}</span>
                </div>
              ) : null;
            })}
            <hr />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              <span>Total:</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button 
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '14px 35px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 123, 255, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
}

export default Purchase;