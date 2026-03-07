import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/MyNavbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Footer from './components/Footer';
import About from './components/About';
import Favorites from './components/‍MyFav';
import { Toaster, toast } from 'react-hot-toast';
import Reviews from './components/MyReviews';
import { supabase } from './supabaseClient';
import MyOrders from './components/OrderList';
import PromoBanner from './components/PromoBanner';
import Stats from './components/Stats';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const MainShop = () => {
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Pizza");

  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState('');

  const [shopStatus, setShopStatus] = useState({ isOpen: true, message: '', type: '' });
  const [currentWord, setCurrentWord] = useState(0);
  const loadingWords = ["Heating up the Oven... 🔥", "Rolling the Dough... 🍕", "Adding Fresh Toppings... 🍅", "Almost Ready... 🚀"];

  const [cartItems, setCartItems] = useState(() => {
  try {
    const savedCart = localStorage.getItem('pizzaCart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage", error);
    return [];
  }
  });

  useEffect(() => {
  localStorage.setItem('pizzaCart', JSON.stringify(cartItems));
}, [cartItems]);

  useEffect(() => {
    const fetchMenu = async () => {
      let { data, error } = await supabase.from('menu_items').select('*');
      if (error) {
        console.log('Error fetching menu:', error);
      } else {
        setMenuItems(data || []); 
      }
    };
    fetchMenu();

    const menuSubscription = supabase
      .channel('realtime-menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
          fetchMenu(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(menuSubscription);
    };
  }, []);
  
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myFavorites')) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem('myFavorites', JSON.stringify(favorites)), [favorites]);

  const [myOrders, setMyOrders] = useState(() => {
    try { 
      const saved = localStorage.getItem('myOrders');
      return saved ? JSON.parse(saved) : [];
    } catch { 
      return []; 
    }
  });

  useEffect(() => {
    localStorage.setItem('myOrders', JSON.stringify(myOrders));
  }, [myOrders]);

  useEffect(() => {
    const fetchLatestStatus = async () => {
       if (myOrders.length === 0) return;
       const orderIds = myOrders.map(o => o.id);
       
       const { data } = await supabase
        .from('orders')
        .select('id, status')
        .in('id', orderIds);

       if (data) {
         setMyOrders(prevOrders => prevOrders.map(localOrder => {
            const dbOrder = data.find(d => d.id === localOrder.id);
            return dbOrder ? { ...localOrder, status: dbOrder.status } : localOrder;
         }));
       }
    };
    fetchLatestStatus();
  }, [myOrders.length]); 


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentWord((prev) => (prev + 1) % loadingWords.length);
      }, 2000); 
      return () => clearInterval(interval);
    }
  }, [loading]);


  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new;
          setMyOrders(prevOrders => prevOrders.map(order => {
             if (order.id === updatedOrder.id) {
                toast(`Order #${order.id} is now ${updatedOrder.status}! 🔔`, { icon: '🛵' });
                return { ...order, status: updatedOrder.status };
             }
             return order;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    checkShopStatus();
    
    const statusChannel = supabase.channel('public:store_settings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => checkShopStatus())
    .subscribe();

    const interval = setInterval(checkShopStatus, 60000);
    return () => { clearInterval(interval); supabase.removeChannel(statusChannel); };
  }, []);

  const checkShopStatus = async () => {
    let { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .order('id', { ascending: false }) 
        .limit(1)
        .single();
    
    console.log("Database Data:", data); 

    if (!data) {
        const { data: newData } = await supabase.from('store_settings').insert([{
            open_time: '08:00:00',
            close_time: '22:00:00',
            is_holiday_active: false
        }]).select().single();
        
        if (newData) data = newData;
        else return;
    }

    const now = new Date();

    if (data.is_holiday_active && data.holiday_start && data.holiday_end) {
        const start = new Date(data.holiday_start);
        const end = new Date(data.holiday_end);
        
        if (now >= start && now <= end) {
            const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
            const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

            const holidayMsg = `Due to unavoidable circumstances, our shop is temporarily closed from ${formatDate(start)} ${formatTime(start)} to ${formatDate(end)} ${formatTime(end)}. We apologize for any inconvenience caused. Thank you for your understanding.`;

            setShopStatus({ isOpen: false, type: 'holiday', message: holidayMsg });
            return;
        }
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = data.open_time.split(':').map(Number);
    const openTimeMinutes = openHour * 60 + openMin; 

    const [closeHour, closeMin] = data.close_time.split(':').map(Number);
    let closeTimeMinutes = closeHour * 60 + closeMin; 

    if (closeTimeMinutes < openTimeMinutes) {
        closeTimeMinutes += 24 * 60; 
    }

    let isCurrentlyOpen = false;

    if (closeTimeMinutes > 24 * 60) {
        if (currentMinutes >= openTimeMinutes || currentMinutes < (closeTimeMinutes - 24 * 60)) {
            isCurrentlyOpen = true;
        }
    } else {
        if (currentMinutes >= openTimeMinutes && currentMinutes < closeTimeMinutes) {
            isCurrentlyOpen = true;
        }
    }

    if (!isCurrentlyOpen) {
        const to12h = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        };
        
        const msg = `Shop is currently closed. Our Operating Hours: ${to12h(data.open_time)} - ${to12h(data.close_time)}. We look forward to serving you during our business hours!`;
        
        setShopStatus({ isOpen: false, type: 'daily', message: msg });
        return;
    }

    setShopStatus({ isOpen: true, type: '', message: '' });
  };
  
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
      toast.success("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      toast.success("Added to favorites");
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  const openModel = (pizza) => {
    if (!shopStatus.isOpen) {
        toast.error("Shop is Closed! Cannot add items at this time.", {
            duration: 3000,
            icon: '🔒'
        });
        return;
    }
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
    if (!shopStatus.isOpen) {
        toast.error("Shop is closed. Please try again during business hours.");
        return;
    }
    
    if (!selectedPizza) return;
    const itemName = selectedVariant ? `${selectedPizza.name} (${selectedVariant})` : selectedPizza.name;
    const newItem = {
        id: selectedPizza.id + (selectedVariant || ""), 
        name: itemName,
        price: Number(currentPrice),
        quantity: Number(quantity),
        image: selectedPizza.image_url || selectedPizza.image
    };
    
    const existing = cartItems.find(item => item.id === newItem.id);
    if (existing) {
      setCartItems(cartItems.map(item => item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item));
    } else {
      setCartItems([...cartItems, newItem]);
    }
    setShowModal(false);
    toast.success("Added to cart!");
  };

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  const applyPromoCode = async () => {
    if (!promoInput) return;

    const loadingToast = toast.loading("Checking code...");

    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promoInput.toUpperCase())
            .maybeSingle();

        toast.dismiss(loadingToast);

        if (error || !data) {
            toast.error("Invalid Promo Code!");
            return;
        }

        const now = new Date();
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        if (now < start || now > end) {
            toast.error("This code has expired!");
            return;
        }

        let discountableAmount = 0;
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        if (data.apply_to === 'All' || !data.apply_to) {
            discountableAmount = subtotal;
        } else {
            discountableAmount = cartItems
                .filter(item => item.category === data.apply_to)
                .reduce((acc, item) => acc + (item.price * item.quantity), 0);
            
            if (discountableAmount === 0) {
                toast.error(`This code is only valid for ${data.apply_to} items!`);
                return;
            }
        }

        let discount = 0;
        if (data.discount_type === 'percentage') {
            discount = (discountableAmount * data.value) / 100;
        } else {
            discount = Math.min(data.value, discountableAmount);
        }

        setDiscountAmount(discount);
        setAppliedPromo(data);
        toast.success(`Coupon Applied! You saved Rs. ${discount.toLocaleString()}`);

    } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Something went wrong!");
        console.error(err);
    }
};

  const confirmOrder = async () => {
      if (!shopStatus.isOpen) { toast.error("Shop Closed!"); return; }
      if (!custName || !custPhone || !custAddress) { toast.error("Please fill all details!"); return; }

      const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      const finalTotal = discountAmount > 0 ? (subtotal - discountAmount) : subtotal;
      
      const orderDate = new Date();

      const { data, error } = await supabase
        .from('orders')
        .insert([{ 
            customer_name: custName, 
            phone: custPhone, 
            address: custAddress, 
            items: cartItems, 
            total_price: finalTotal, 
            status: 'Pending'
        }])
        .select();

      if (error) {
          console.error("Order submission error:", error);
          toast.error("Failed to place order!");
          return;
      }

      const finalID = (data && data.length > 0) ? data[0].id : Date.now();
      const createdAt = (data && data.length > 0) ? data[0].created_at : orderDate.toISOString();

      const newLocalOrder = {
          id: finalID, 
          date: new Date(createdAt).toLocaleDateString(), 
          time: new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          customerName: custName,
          customerPhone: custPhone,
          customerAddress: custAddress,
          items: [...cartItems], 
          total: finalTotal, 
          status: 'Pending',
          created_at: createdAt
      };

      setMyOrders(prevOrders => {
          const updatedOrders = [newLocalOrder, ...prevOrders];
          localStorage.setItem('myOrders', JSON.stringify(updatedOrders));
          return updatedOrders;
      });

      let msg = `🍕 *New Order #${finalID}* 🍕\n\n`;
      
      cartItems.forEach(i => {
          msg += `▪️ ${i.name} x ${i.quantity}\n`;
      });

      msg += `\n--------------------------`;

      if (discountAmount > 0 && appliedPromo) {
          msg += `\nSubtotal: Rs. ${subtotal.toLocaleString()}`;
          msg += `\nPromo Applied: *${appliedPromo.code}* `;
          msg += `\nDiscount: - Rs. ${discountAmount.toLocaleString()}`;
          msg += `\n*Final Total: Rs. ${finalTotal.toLocaleString()}*`;
      } else {
          msg += `\n*Total Amount: Rs. ${finalTotal.toLocaleString()}*`;
      }

      msg += `\n--------------------------\n`;
      msg += `\n*Customer Details:*`;
      msg += `\n👤 Name: ${custName}`;
      msg += `\n📞 Phone: ${custPhone}`;
      msg += `\n📍 Address: ${custAddress}`;
      
      setCartItems([]);
      setCustName('');
      setCustPhone('');
      setCustAddress('');

      if(typeof setDiscountAmount === 'function') setDiscountAmount(0);
      if(typeof setAppliedPromo === 'function') setAppliedPromo(null);
      if(typeof setPromoInput === 'function') setPromoInput('');

      setShowCheckoutModal(false);
      toast.success("Order Placed Successfully!");

      window.open(`https://wa.me/94123456789?text=${encodeURIComponent(msg)}`, "_blank");
    };

  return (
    <div>
      {!shopStatus.isOpen && shopStatus.message && (
        <div className={`shop-closed-banner ${shopStatus.type === 'holiday' ? 'holiday-mode' : 'daily-closed'}`}
        style={{ minHeight: '40px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="banner-icon">
                {shopStatus.type === 'holiday'}
            </div>
            <p className="banner-message">{shopStatus.message}</p>
        </div>
      )}

      <Navbar 
        cartCount={cartItems.length}
        toggleCart={() => setIsCartOpen(true)} 
        toggleFavorites={() => setShowFavorites(true)}
        toggleMyOrders={() => setShowMyOrders(true)}
        menuItems={menuItems}  
        setActiveCategory={setActiveCategory}
      />
      <div style={{ 
          marginTop: !shopStatus.isOpen ? '80px' : '0px', 
          transition: 'margin-top 0.4s ease-in-out' 
      }}></div>
      <PromoBanner />
      <Hero/>
      
      <div id="about"><About/></div>
      <div id="stats"><Stats /></div>
      <div id="menu">
        <Menu menuItems={menuItems} openModel={openModel} favorites={favorites} toggleFavorite={toggleFavorite} isShopOpen={shopStatus.isOpen} activeCategory={activeCategory} setActiveCategory={setActiveCategory}/>
      </div>
      <div id="reviews"><Reviews /></div>

      {showModal && selectedPizza && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img src={selectedPizza.image_url || selectedPizza.image} alt={selectedPizza.name} style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'10px', marginBottom:'10px'}} />
            <h3>{selectedPizza.name}</h3>
            <p style={{color: '#555', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4'}}>{selectedPizza.description || selectedPizza.desc || "No description available."}</p>
            {selectedPizza.variants && (
                <select onChange={(e) => { setSelectedVariant(e.target.value); setCurrentPrice(selectedPizza.variants.find(v => v.name === e.target.value).price); }} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>
                    {selectedPizza.variants.map((v,i) => <option key={i} value={v.name}>{v.name} - Rs.{v.price}</option>)}
                </select>
            )}
            <div className="quantity-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button><span>{quantity}</span><button onClick={() => setQuantity(q => q+1)}>+</button>
            </div>
            <h4>Total: Rs. {currentPrice * quantity}</h4>
            <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="confirm-btn" onClick={confirmAddToCart} disabled={!shopStatus.isOpen}>
                    {shopStatus.isOpen ? 'Add to Cart' : 'Shop Closed'}
                </button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
  <Cart 
      cart={cartItems} 
      onClose={() => setIsCartOpen(false)} 
      removeFromCart={(id) => setCartItems(cartItems.filter(i => i.id !== id))} 
      isShopOpen={shopStatus.isOpen}
      
      discountAmount={discountAmount}
      setDiscountAmount={setDiscountAmount} 
      appliedPromo={appliedPromo}
      setAppliedPromo={setAppliedPromo}
      promoInput={promoInput}
      setPromoInput={setPromoInput}
      applyPromoCode={applyPromoCode}
            
            handleCheckoutClick={() => { 
                if(!shopStatus.isOpen) {
                    toast.error("Shop is Closed! Cannot checkout at this time.", { duration: 3000, icon: '🔒' });
                    return;
                }
                if(cartItems.length===0) {
                    toast.error("Your cart is empty!");
                    return;
                }
                setIsCartOpen(false); 
                setShowCheckoutModal(true); 
            }} 
        />
      )}
      
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="checkout-modal-content">
             <div className="checkout-header"><h3>Delivery Details</h3><button className="close-btn-small" onClick={() => setShowCheckoutModal(false)}>X</button></div>
             <div className="input-group"><label>Customer Name</label><input value={custName} onChange={e=>setCustName(e.target.value)}/></div>
             <div className="input-group"><label>Customer Contact Number</label><input value={custPhone} onChange={e=>setCustPhone(e.target.value)}/></div>
             <div className="input-group"><label>Customer Address</label><textarea value={custAddress} onChange={e=>setCustAddress(e.target.value)}/></div>
             <div className="checkout-footer">
                 <button className="whatsapp-confirm-btn" onClick={confirmOrder} disabled={!shopStatus.isOpen}>
                    {shopStatus.isOpen ? 'Confirm via WhatsApp' : 'Shop Closed'}
                 </button>
             </div>
          </div>
        </div>
      )}

      {showFavorites && <div className="modal-overlay"><Favorites favorites={favorites} menuItems={menuItems} closeFavorites={() => setShowFavorites(false)} toggleFavorite={toggleFavorite} addToCart={openModel} /></div>}

      {showMyOrders && <div className="modal-overlay"><MyOrders orders={myOrders} closeMyOrders={() => setShowMyOrders(false)} /></div>}

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