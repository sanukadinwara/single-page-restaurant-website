import React from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import '../App.css'; 

// මෙතන වරහන් ඇතුලේ 'cart' සහ 'handleCheckoutClick' තියෙන්නම ඕන
const Cart = ({ cartItems, onClose, removeFromCart, handleCheckoutClick, cart }) => {

  // ආරක්‍ෂිත පියවරක්: cart හෝ cartItems දෙකෙන් ඕනම එකක් ආවොත් ඒක ගන්නවා.
  const finalCart = cart || cartItems || [];

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h2>Your Cart ({finalCart.length})</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="cart-items">
          {finalCart.length === 0 ? (
            <p className="empty-cart">Your cart is empty!</p>
          ) : (
            finalCart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Rs. {item.price} x {item.quantity}</p>
                </div>
                <button 
                  className="remove-btn" 
                  onClick={() => removeFromCart(item.id)}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <h3>
            Total: Rs. {finalCart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
          </h3>
          
          <button className="checkout-btn" onClick={handleCheckoutClick}>
            Continue via WhatsApp 
          </button>
          <button 
              className="checkout-btn" 
              disabled={!isShopOpen || cart.length === 0}
          >
              {isShopOpen ? 'Place Order' : 'Shop Closed'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;