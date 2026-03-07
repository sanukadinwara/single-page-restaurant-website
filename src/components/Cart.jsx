import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaTimes, FaTrash, FaWhatsapp, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../App.css'; 
import toast from 'react-hot-toast';

const Cart = ({ cart, onClose, removeFromCart, isShopOpen, promoInput, setPromoInput, applyPromoCode, discountAmount, appliedPromo }) => {

  const [isSaving, setIsSaving] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
      name: '',
      address: '',
      phone: '',
      email: ''
  });

  const finalCart = cart || [];

  const subTotal = finalCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subTotal - discountAmount;

  const handleProceedToCheckout = () => {
      if (!isShopOpen) {
          toast.error("Shop is closed right now!");
          return;
      }
      setShowCheckoutForm(true);
  };

  const handleWhatsAppOrder = async () => {
    if (!customerDetails.name || !customerDetails.address || !customerDetails.phone || !customerDetails.email) {
        toast.error("Please fill in all details!");
        return;
    }

    setIsSaving(true); 

    const { data, error } = await supabase
        .from('orders')
        .insert([{
            customer_name: customerDetails.name,
            address: customerDetails.address,
            phone: customerDetails.phone,
            items: finalCart, 
            total_price: grandTotal,
            discount: discountAmount,
            status: 'Pending'
        }])
        .select();

    if (error || !data) {
        toast.error("Something went wrong! Please try again.");
        setIsSaving(false);
        return; 
    }

    const insertedOrder = data[0];
    const savedOrderIds = JSON.parse(localStorage.getItem('my_orders')) || [];
    savedOrderIds.push(insertedOrder.id);
    localStorage.setItem('my_orders', JSON.stringify(savedOrderIds));

    const phoneNumber = "94123456789"; 
    let message = `*New Order via Pizza Palace App* \n`;
    message += `----------------------------\n`;
    message += `1) *Name:* ${customerDetails.name}\n`;
    message += `2) *Address:* ${customerDetails.address}\n`;
    message += `3) *Phone:* ${customerDetails.phone}\n`;
    message += `----------------------------\n\n`;
    message += `*ORDER ITEMS:* \n`;
    
    finalCart.forEach((item, index) => {
      const letter = String.fromCharCode(97 + index);
      message += `${letter}) ${item.name} x ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n----------------------------\n`;
    message += `*Subtotal:* Rs. ${subTotal.toFixed(2)}\n`;

    if (appliedPromo) {
       message += `*Promo Code:* ${appliedPromo.code}\n`;
       message += `*Discount:* - Rs. ${discountAmount.toFixed(2)}\n`;
    }

    message += `*NET TOTAL: Rs. ${grandTotal.toFixed(2)}* \n`; 
    message += `----------------------------\n`;
    message += `*Please confirm my order!*`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");

    setIsSaving(false);
    onClose(); 
    toast.success("Order Placed Successfully!");
  };

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        
        <div className="cart-header">
          <h2>{showCheckoutForm ? "Checkout Details" : `Your Cart (${finalCart.length})`}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {showCheckoutForm ? (
            <div className="checkout-form-wrapper" style={{ 
                padding: '20px', 
                maxHeight: '80vh', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '15px'
            }}>
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Delivery Details</h3>
                
                <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                        <FaUser style={{ color: '#333333' }} /> Name
                    </label>
                    <input 
                        className="admin-input" 
                        placeholder="Ex: John Doe"
                        value={customerDetails.name} 
                        onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    </div>

                <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                        <FaEnvelope style={{ color: '#333333' }} /> Email Address
                    </label>
                    <input 
                        className="admin-input" 
                        placeholder="Ex: john@email.com"
                        value={customerDetails.email} 
                        onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    </div>

                <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                        <FaMapMarkerAlt style={{ color: '#333333' }} /> Address
                    </label>
                    <textarea 
                        className="admin-input" 
                        placeholder="House No, Street, City"
                        value={customerDetails.address} 
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', height: '60px' }}
                    />
                    </div>

                <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                        <FaPhone style={{ color: '#333333' }} /> Contact Number
                    </label>
                    <input 
                        className="admin-input" 
                        placeholder="Ex: 0123456789"
                        value={customerDetails.phone} 
                        onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    </div>

                <div className="checkout-summary" style={{ 
                background: '#f9f9f9', 
                padding: '15px', 
                borderRadius: '8px',
                marginTop: '10px'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>Rs. {subTotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
                    <span>Discount:</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    marginTop: '10px',
                    borderTop: '1px solid #ddd',
                    paddingTop: '10px',
                    color: '#e67e22'
                }}>
                    <span>Net Total:</span>
                    <span>Rs. {grandTotal.toFixed(2)}</span>
                </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingBottom: '20px' }}>
                <button 
                    onClick={() => setShowCheckoutForm(false)} 
                    style={{ flex: 1, padding: '12px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Back
                </button>
                <button 
                    onClick={handleWhatsAppOrder} 
                    disabled={isSaving}
                    style={{ 
                    flex: 2, 
                    padding: '12px', 
                    background: '#25D366', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    fontWeight: 'bold',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                    }}
                >
                    <FaWhatsapp size={20} /> {isSaving ? 'Placing Order...' : 'Confirm Order'}
                </button>
                </div>
            </div>
            ) : (
            <>
                <div className="cart-items">
                {finalCart.length === 0 ? (
                    <p className="empty-cart">Your cart is empty!</p>
                ) : (
                    finalCart.map((item) => (
                    <div key={item.id} className="cart-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Rs. {item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                          <FaTrash />
                        </button>
                    </div>
                    ))
                )}
                </div>

                {finalCart.length > 0 && (
                    <div className="cart-footer">
                        <div className="promo-section" style={{marginBottom: '15px'}}>
                            <div style={{display:'flex', gap:'5px'}}>
                                <input 
                                    type="text" 
                                    placeholder="Promo Code" 
                                    value={promoInput} 
                                    className="admin-input"
                                    style={{width:'70%', height:'50px', padding:'8px'}}
                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())} 
                                />
                                <button 
                                    onClick={applyPromoCode} 
                                    style={{width:'30%', height:'50px', background:'#ff6b6b', color:'white', border:'none', cursor:'pointer'}}
                                >
                                    Apply
                                </button>
                            </div>
                            {appliedPromo && <p style={{color:'green', fontSize:'12px', marginTop:'5px'}}>Promo Applied!</p>}
                        </div>

                        <div className="totals-display" style={{textAlign:'right', marginBottom:'20px'}}>
                            <p>Subtotal: Rs. {subTotal.toFixed(2)}</p>
                            {discountAmount > 0 && <p style={{color:'green'}}>Discount: - Rs. {discountAmount.toFixed(2)}</p>}
                            <h3 style={{fontSize:'20px', borderTop:'1px solid #ccc', paddingTop:'5px'}}>
                                Total: Rs. {grandTotal.toFixed(2)}
                            </h3>
                        </div>

                        <button className="checkout-btn" onClick={handleProceedToCheckout} disabled={!isShopOpen}>
                             {isShopOpen ? 'Proceed to Checkout' : 'Shop Closed'}
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default Cart;