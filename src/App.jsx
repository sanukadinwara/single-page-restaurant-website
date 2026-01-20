import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/navbar.jsx';
import Hero from './components/hero.jsx';
import Menu from './components/menu.jsx';
import Cart from './components/cart.jsx';
import Footer from './components/footer.jsx';
import About from './components/about.jsx';
import {Toaster, toast} from 'react-hot-toast';

function App(){

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  const addToCart = (pizza) => {
    setCartItems([...cartItems, pizza]);

    toast.success(`Item added to cart successfully!`, {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }

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

    const itemNameWithVariant = `${selectedPizza.name} (${selectedVariant})`;

    const newItem = {
        id: selectedPizza.id + selectedVariant, 
        name: itemNameWithVariant,
        price: currentPrice, 
    };

    const existingItem = cartItems.find(item => item.id === selectedPizza.id);

    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === selectedPizza.id 
        ? { ...item, quantity: item.quantity + quantity } 
        : item
      ));

      } else {
      setCartItems([...cartItems, newItem]);
    }

    setShowModal(false);
    toast.success(`Added ${quantity} x ${itemNameWithVariant} to cart! 🛒`);
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  }

  return(
    <div className="App">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <Navbar
        cartCount={cartItems.length}
        onCartClick={()=>setIsCartOpen(true)}
      />
      <Hero/>
      <About/>
      <Menu openModel={openModel}/>

      {showModal && selectedPizza &&(
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>How many {selectedPizza?.name}s? 🍕</h3>
            
            <div style={{marginBottom: '15px', textAlign: 'left'}}>
                <label style={{fontSize: '0.9rem', fontWeight: 'bold'}}>Select Option:</label>
                <select 
                    value={selectedVariant} 
                    onChange={handleVariantChange}
                    style={{width: '100%', padding: '8px', marginTop: '5px', borderRadius: '5px'}}
                >
                    {selectedPizza.variants.map((v, index) => (
                        <option key={index} value={v.name}>
                            {v.name} - Rs. {v.price.toFixed(2)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="quantity-controls">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <h4 style={{color: '#ff9f1c', margin: '15px 0'}}>
                Price: Rs. {(currentPrice * quantity).toFixed(2)}
            </h4>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmAddToCart}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

    {isCartOpen && (
      <Cart
        cartItems={cartItems}
        onClose={()=> setIsCartOpen(false)}
        removeFromCart={removeFromCart}
      />  
    )}  
      
    <Footer /> 
      
    </div>
    
  );
}

export default App;