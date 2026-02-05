import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaTimes, FaTrash, FaWhatsapp, FaUser, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import '../App.css'; 
import toast from 'react-hot-toast';

const Cart = ({ cartItems, onClose, removeFromCart, cart, isShopOpen }) => {

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); 
  const [promoStatus, setPromoStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
      name: '',
      address: '',
      phone: ''
  });

  const finalCart = cart || cartItems || [];

  const subTotal = finalCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subTotal - discount;

  const applyPromo = async () => {
    const today = new Date().toISOString().split('T')[0];
    if(!promoCode) return;

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode)
      .single();

    if (error || !data) {
      setPromoStatus('invalid');
      setDiscount(0);
      return;
    }

    if (today < data.start_date || today > data.end_date) {
      setPromoStatus('expired');
      setDiscount(0);
    } else {
      setPromoStatus('valid');
      if (data.discount_type === 'percentage') {
        setDiscount((subTotal * data.value) / 100); 
      } else {
        setDiscount(data.value); 
      }
    }
  };

  const handleProceedToCheckout = () => {
      if (!isShopOpen) {
          alert("Shop is closed right now!");
          return;
      }
      setShowCheckoutForm(true);
  };

  const handleWhatsAppOrder = async () => {
    if (!customerDetails.name || !customerDetails.address || !customerDetails.phone) {
        alert("Please fill in all details (Name, Address, Phone)!");
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
            discount: discount,
            status: 'Pending'
        }]);

    if (error) {
        console.error('Error saving order:', error);
        alert("Something went wrong! Please try again.");
        setIsSaving(false);
        return; 
    }

    const phoneNumber = "94710993625"; 

    let message = `*🍕 New Order via Pizza Palace App* \n`;
    message += `----------------------------\n`;
    message += `👤 *Name:* ${customerDetails.name}\n`;
    message += `📍 *Address:* ${customerDetails.address}\n`;
    message += `📞 *Phone:* ${customerDetails.phone}\n`;
    message += `----------------------------\n\n`;
    message += `*ORDER ITEMS:* \n`;
    
    finalCart.forEach((item) => {
        message += `▫️ ${item.name} x ${item.quantity} = Rs. ${item.price * item.quantity}\n`;
    });

    message += `\n----------------------------\n`;
    message += `*Subtotal:* Rs. ${subTotal}\n`;

    if (promoStatus === 'valid') {
       message += `*Promo Code:* ${promoCode} ✅\n`;
       message += `*Discount:* - Rs. ${discount.toFixed(2)}\n`;
    }

    message += `*NET TOTAL: Rs. ${grandTotal.toFixed(2)}* \n`; 
    message += `----------------------------\n`;
    message += `Please confirm my order! 🛵`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setIsSaving(false);
    onClose(); 
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
            <div className="checkout-form-container" style={{padding: '20px'}}>
                
                <div className="form-group" style={{marginBottom: '15px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: '#555'}}>
                        <FaUser />
                        <label style={{fontWeight:'bold'}}>Name</label>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Enter your name"
                        className="admin-input" 
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                        style={{width: '100%', boxSizing: 'border-box', padding: '10px'}}
                    />
                </div>

                <div className="form-group" style={{marginBottom: '15px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: '#555'}}>
                        <FaMapMarkerAlt />
                        <label style={{fontWeight:'bold'}}>Address</label>
                    </div>
                    <textarea 
                        placeholder="Enter delivery address"
                        className="admin-input"
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                        style={{width: '100%', boxSizing: 'border-box', padding: '10px', height: '80px', fontFamily: 'inherit'}}
                    />
                </div>

                <div className="form-group" style={{marginBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: '#555'}}>
                        <FaPhone />
                        <label style={{fontWeight:'bold'}}>Phone Number</label>
                    </div>
                    <input 
                        type="tel" 
                        placeholder="077xxxxxxx"
                        className="admin-input"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                        style={{width: '100%', boxSizing: 'border-box', padding: '10px'}}
                    />
                </div>

                <h3>Total to Pay: Rs. {grandTotal.toFixed(2)}</h3>

                <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                    <button 
                        className="admin-btn" 
                        style={{background:'#ccc', color:'black', flex: 1}}
                        onClick={() => setShowCheckoutForm(false)} 
                    >
                        Back
                    </button>
                    
                    <button 
                        className="checkout-btn" 
                        onClick={handleWhatsAppOrder} 
                        disabled={isSaving} 
                        style={{
                            flex: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            opacity: isSaving ? 0.7 : 1 
                        }}
                    >
                        {isSaving ? 'Processing...' : (
                            <>
                                <FaWhatsapp size={20} /> Confirm Order
                            </>
                        )}
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

                {finalCart.length > 0 && (
                    <div className="cart-footer">
                        
                        <div className="promo-section" style={{marginBottom: '15px'}}>
                            <div style={{display:'flex', gap:'5px'}}>
                                <input 
                                    type="text" 
                                    placeholder="Promo Code" 
                                    value={promoCode}
                                    className="admin-input"
                                    style={{width:'70%', height:'50px', padding:'8px'}}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())} 
                                />
                                <button 
                                    onClick={applyPromo} 
                                    style={{width:'30%', height:'50px', background:'#ff6b6b', color:'white', border:'none', cursor:'pointer'}}
                                >
                                    Apply
                                </button>
                            </div>
                            {promoStatus === 'valid' && <p style={{color:'green', fontSize:'12px'}}>Promo Applied! ✅</p>}
                            {promoStatus === 'invalid' && <p style={{color:'red', fontSize:'12px'}}>Invalid Code ❌</p>}
                            {promoStatus === 'expired' && <p style={{color:'red', fontSize:'12px'}}>Promotion Ended ⚠️</p>}
                        </div>

                        <div className="totals-display" style={{textAlign:'right', marginBottom:'20px'}}>
                            <p>Subtotal: Rs. {subTotal.toFixed(2)}</p>
                            {discount > 0 && <p style={{color:'green'}}>Discount: - Rs. {discount.toFixed(2)}</p>}
                            <h3 style={{fontSize:'20px', borderTop:'1px solid #ccc', paddingTop:'5px'}}>
                                Total: Rs. {grandTotal.toFixed(2)}
                            </h3>
                        </div>

                        <button 
                            className="checkout-btn" 
                            onClick={handleProceedToCheckout}
                            disabled={!isShopOpen}
                        >
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