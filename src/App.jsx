import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/MyNavbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Footer from './components/Footer';
import About from './components/About';
import Favorites from './components/Favorites';
import { Toaster, toast } from 'react-hot-toast';
import Reviews from './components/Reviews';
import { menuItems } from './data/data'; 
import MyOrders from './components/MyOrders';
import PromoBanner from './components/PromoBanner';
import Stats from './components/Stats';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const MainShop = () => {
  // --- States ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  
  // Favorites LocalStorage
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myFavorites')) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem('myFavorites', JSON.stringify(favorites)), [favorites]);

  // Orders LocalStorage
  const [myOrders, setMyOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myOrders')) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem('myOrders', JSON.stringify(myOrders)), [myOrders]);

  // --- Logic Functions ---
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
      toast.error("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      toast.success("Added to favorites");
    }
  };

  const saveOrderToHistory = () => {
    if (cartItems.length === 0) return;
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleDateString(), 
        items: [...cartItems], 
        total: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    };
    setMyOrders([...myOrders, newOrder]);
    setCartItems([]); 
    setIsCartOpen(false); 
  };

  // Cart Add Logic
  const [showModal, setShowModal] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  const openModel = (pizza) => {
    setSelectedPizza(pizza);
    setQuantity(1); 
    if (pizza.variants?.length) {
        setSelectedVariant(pizza.variants[0].name);
        setCurrentPrice(pizza.variants[0].price);
    } else {
        setCurrentPrice(Number(pizza.price));
    }
    setShowModal(true);
  };

  const confirmAddToCart = () => {
    if (!selectedPizza) return;
    const itemName = selectedVariant ? `${selectedPizza.name} (${selectedVariant})` : selectedPizza.name;
    const newItem = {
        id: selectedPizza.id + (selectedVariant || ""), 
        name: itemName,
        price: Number(currentPrice),
        quantity: Number(quantity),
        image: selectedPizza.image
    };
    
    const existing = cartItems.find(item => item.id === newItem.id);
    if (existing) {
      setCartItems(cartItems.map(item => item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item));
    } else {
      setCartItems([...cartItems, newItem]);
    }
    setShowModal(false);
    toast.success("Added to cart! 🍕");
  };

  // Checkout Logic
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  const confirmOrder = () => {
    if (!custName || !custPhone || !custAddress) { alert("Please fill all details!"); return; }
    let msg = "🍕 *New Order* 🍕\n\n";
    cartItems.forEach(i => msg += `${i.name} x ${i.quantity}\n`);
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    msg += `\nTotal: Rs. ${total}\n\n👤 ${custName}\n📞 ${custPhone}\n🏠 ${custAddress}`;
    
    window.open(`https://wa.me/9477xxxxxxx?text=${encodeURIComponent(msg)}`, "_blank");
    setShowCheckoutModal(false);
    setCartItems([]);
  };

  return (
    <div>
      <Navbar 
        cartCount={cartItems.length}
        toggleCart={() => setIsCartOpen(true)} 
        toggleFavorites={() => setShowFavorites(true)}
        toggleMyOrders={() => setShowMyOrders(true)}
      />

      <PromoBanner />
      <Hero/>
      
      {/* Scroll වීම සඳහා IDs දැම්මා */}
      <div id="about"><About/></div>
      <div id="stats"><Stats /></div>
      <div id="menu">
        <Menu openModel={openModel} favorites={favorites} toggleFavorite={toggleFavorite} />
      </div>
      <div id="reviews"><Reviews /></div>

      {/* --- MODALS --- */}
      
      {/* 1. Add to Cart Modal */}
      {showModal && selectedPizza && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedPizza.name}</h3>
            {selectedPizza.variants && (
                <select onChange={(e) => {
                    setSelectedVariant(e.target.value);
                    setCurrentPrice(selectedPizza.variants.find(v => v.name === e.target.value).price);
                }} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>
                    {selectedPizza.variants.map((v,i) => <option key={i} value={v.name}>{v.name} - Rs.{v.price}</option>)}
                </select>
            )}
            <div className="quantity-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)}>+</button>
            </div>
            <h4>Total: Rs. {currentPrice * quantity}</h4>
            <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="confirm-btn" onClick={confirmAddToCart}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cart Sidebar Modal */}
      {isCartOpen && (
        <Cart 
            cart={cartItems} // Note: Prop name might be 'cartItems' in your Cart.jsx, check that if it fails
            onClose={() => setIsCartOpen(false)} 
            removeFromCart={(id) => setCartItems(cartItems.filter(i => i.id !== id))} 
            handleCheckoutClick={() => { 
                if(cartItems.length===0) return; 
                setIsCartOpen(false); // Close cart when opening checkout
                setShowCheckoutModal(true); 
            }} 
        />
      )}
      
      {/* 3. Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="checkout-modal-content">
             <div className="checkout-header">
                <h3>Delivery Details</h3>
                <button className="close-btn-small" onClick={() => setShowCheckoutModal(false)}>X</button>
             </div>
             <div className="input-group"><label>Customer Name</label><input onChange={e=>setCustName(e.target.value)}/></div>
             <div className="input-group"><label>Customer Contact Number</label><input onChange={e=>setCustPhone(e.target.value)}/></div>
             <div className="input-group"><label>Customer Address</label><textarea onChange={e=>setCustAddress(e.target.value)}/></div>
             <div className="checkout-footer">
                <button className="whatsapp-confirm-btn" onClick={confirmOrder}>Confirm via WhatsApp</button>
             </div>
          </div>
        </div>
      )}

      {/* 4. Favorites & Orders */}
      {showFavorites && (
          <div className="modal-overlay">
            <Favorites favorites={favorites} menuItems={menuItems} closeFavorites={() => setShowFavorites(false)} toggleFavorite={toggleFavorite} addToCart={openModel} />
          </div>
      )}

      {showMyOrders && (
          <div className="modal-overlay">
            <MyOrders orders={myOrders} closeMyOrders={() => setShowMyOrders(false)} />
          </div>
      )}

      <div id="contact"><Footer /></div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
       <Toaster position="top-center" reverseOrder={false} containerStyle={{ zIndex: 9999999 }} />
       <Routes>
          <Route path="/" element={<MainShop />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}/>
       </Routes>
    </div>
  );
}

export default App;