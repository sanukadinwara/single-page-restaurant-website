import React from "react";
import { FaTrash } from "react-icons/fa";

function Cart({ cartItems, onClose, removeFromCart}){

    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const checkoutAll = () => {
        const phoneNumber = "94771234567";
        
        let message = "👋 Hi! I would like to place an order:\n\n";

        cartItems.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* (x${item.quantity}) - Rs. ${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\n💰 *Total Bill: Rs. ${totalPrice.toFixed(2)}*`;

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return(
        <div className="cart-overlay">
            <div className="cart-model">
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>
                <div className="cart-body">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty!</p>
                        </div>
                    ) : (
                        <ul className="cart-items-list">
                            {cartItems.map((item) => (
                                <li key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <span>{item.name}
                                            <span style={{fontSize: "0.85rem", color: "#ff9f1c", marginLeft: "5px"}}>
                                            (x{item.quantity})
                                            </span>
                                        </span>
                                        <span className="item-price">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )    
                }
                </div>

                <div className="cart-footer">
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold', fontSize: '1.2rem'}}>
                        <span>Total:</span>
                        <span>Rs. {totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="checkout-btn" disabled={cartItems.length == 0} onClick={checkoutAll}>
                        Checkout via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart;