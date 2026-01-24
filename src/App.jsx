import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar.jsx';
import Hero from './components/hero.jsx';
import Menu from './components/menu.jsx';
import Cart from './components/cart.jsx';
import Footer from './components/footer.jsx';
import About from './components/about.jsx';
import Favorites from './components/favorites.jsx';
import { Toaster, toast } from 'react-hot-toast';
import Reviews from './components/reviews';
import { menuItems } from './data/data'; 
import { FaClipboardList } from 'react-icons/fa';
import MyOrders from './components/myorders';
import PromoBanner from './components/PromoBanner';
import Stats from './components/Stats';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const MainShop = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]); // <--- මෙන්න මේක තමයි නම
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('myFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('myFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      toast.error("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      toast.success("Added to favorites");
    }
  };

  const [showMyOrders, setShowMyOrders] = useState(false);
  
  const [myOrders, setMyOrders] = useState(() => {
    const saved = localStorage.getItem('myOrders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('myOrders', JSON.stringify(myOrders));
  }, [myOrders]);

  const saveOrderToHistory = () => {
    if (cartItems.length === 0) return;
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleDateString(), 
        time: new Date().toLocaleTimeString(), 
        items: [...cartItems], 
        total: totalAmount
    };
    setMyOrders([...myOrders, newOrder]);
    setCartItems([]); 
    setIsCartOpen(false); 
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  const openModel = (pizza) => {
    setSelectedPizza(pizza);
    setQuantity(1); 
    if (pizza.variants && pizza.variants.length > 0) {
        setSelectedVariant(pizza.variants[0].name);
        setCurrentPrice(pizza.variants[0].price);
    } else {
        setCurrentPrice(Number(pizza.price));
    }
    setShowModal(true);
  };

  const handleVariantChange = (e) => {
    const variantName = e.target.value;
    setSelectedVariant(variantName);
    const variant = selectedPizza.variants.find(v => v.name === variantName);
    if(variant) setCurrentPrice(variant.price);
  };

  const confirmAddToCart = () => {
    if (!selectedPizza) return;
    const itemNameWithVariant = selectedVariant ? `${selectedPizza.name} (${selectedVariant})` : selectedPizza.name;
    const newItem = {
        id: selectedPizza.id + (selectedVariant || ""), 
        name: itemNameWithVariant,
        price: Number(currentPrice),
        quantity: Number(quantity),
        image: selectedPizza.image
    };

    const existingItem = cartItems.find(item => item.id === newItem.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item));
    } else {
      setCartItems([...cartItems, newItem]);
    }
    setShowModal(false);
    toast.success(`Added to cart! 🛒`);
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  }

  const handleCheckoutClick = () => {
    // FIX 1: cart වෙනුවට cartItems දැම්මා
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setShowCheckoutModal(true); 
  };

  const confirmOrder = () => {
    if (!custName || !custPhone || !custAddress) {
      alert("Please fill in all details!"); 
      return;
    }

    let message = "🍕 *New Order Request* 🍕\n\n*Order Items:*\n";
    
    // FIX 2: cart වෙනුවට cartItems දැම්මා
    cartItems.forEach(item => {
      message += `- ${item.name} x ${item.quantity} = Rs. ${item.price * item.quantity}\n`;
    });

    // FIX 3: cart වෙනුවට cartItems දැම්මා
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    message += `\n💰 *Total Amount:* Rs. ${total}\n`;

    message += `\n----------------------------\n`;
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${custName}\n`;
    message += `Phone: ${custPhone}\n`;
    message += `Address: ${custAddress}\n`;
    message += `----------------------------`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "9477xxxxxxx"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");

    setShowCheckoutModal(false);
    setCartItems([]); // FIX 4: Order එක ගියාම Cart එක හිස් කරනවා
  };

  return (
    <div>
      <Navbar 
        cartCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)} 
        favoriteCount={favorites.length}
        onFavClick={() => setShowFavorites(true)}
        onOrdersClick={() => setShowMyOrders(true)}
      />

      <PromoBanner />
      <Hero/>
      <About/>
      <Stats />
      
      <Menu 
        openModel={openModel}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

      <Reviews />

      {showModal && selectedPizza &&(
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedPizza?.name}</h3>
            <div style={{marginBottom: '15px'}}>
                <label>Select Option:</label>
                <select value={selectedVariant} onChange={handleVariantChange} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                    {selectedPizza.variants && selectedPizza.variants.map((v, index) => (
                        <option key={index} value={v.name}>{v.name} - Rs. {v.price}</option>
                    ))}
                </select>
            </div>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <h4 style={{color: '#ff9f1c', margin: '15px 0'}}>Total: Rs. {(currentPrice * quantity).toFixed(2)}</h4>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmAddToCart}>Add</button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <Cart 
          cartItems={cartItems} 
          onClose={() => setIsCartOpen(false)} 
          removeFromCart={removeFromCart} 
          onCheckout={saveOrderToHistory}
          
          // FIX 5: Cart component එක ඇතුලේ අපි 'cart' කියලා prop එකක් ඉල්ලන නිසා,
          // මෙතනින් 'cartItems' යවන්න ඕන.
          cart={cartItems} 
          
          handleCheckoutClick={handleCheckoutClick}
        />
      )}

      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="checkout-modal-content">
            <div className="checkout-header">
              <h3>📦 Delivery Details</h3>
              <button className="close-btn-small" onClick={() => setShowCheckoutModal(false)}>✖</button>
            </div>
            
            <div className="checkout-body">
              <div className="input-group">
                <label>Your Name</label>
                <input type="text" placeholder="Ex: Kasun Perera" value={custName} onChange={(e) => setCustName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="Ex: 0771234567" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Delivery Address</label>
                <textarea rows="3" placeholder="Ex: No 5, Main St, Colombo" value={custAddress} onChange={(e) => setCustAddress(e.target.value)}></textarea>
              </div>
            </div>

            <div className="checkout-footer">
              <button className="whatsapp-confirm-btn" onClick={confirmOrder}>
                Confirm & WhatsApp 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {showFavorites && (
          <Favorites 
            favorites={favorites} 
            menuItems={menuItems} 
            closeFavorites={() => setShowFavorites(false)}
            toggleFavorite={toggleFavorite}
            addToCart={openModel}
          />
      )}

      {showMyOrders && (
          <MyOrders 
            orders={myOrders} 
            closeMyOrders={() => setShowMyOrders(false)} 
          />
      )}

      <Footer /> 
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