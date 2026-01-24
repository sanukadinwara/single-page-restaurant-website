import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaClipboardList, FaBars, FaTimes } from 'react-icons/fa'; 
import '../App.css';

const Navbar = ({ cartCount, toggleCart, toggleFavorites, toggleMyOrders }) => {
  
  const [isMobile, setIsMobile] = useState(false);

  return (
    <nav className="navbar">
      
      <div className="nav-left">
        <button className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? <FaTimes /> : <FaBars />}
        </button>

        <h1 className="logo">Pizza Palace 🍕</h1>
      </div>

      <ul className={isMobile ? "nav-links-mobile" : "nav-links"} onClick={() => setIsMobile(false)}>
        <li><Link to="/">Home</Link></li>
        <li><a href="#menu">About</a></li>
        <li><a href="#about">Menu</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div className="nav-icons">
        <div className="icon-wrapper" onClick={toggleMyOrders}>
            <FaClipboardList className="nav-icon" />
            <span className="tooltip">My Orders</span>
        </div>

        <div className="icon-wrapper" onClick={toggleFavorites}>
            <FaHeart className="nav-icon" />
            <span className="tooltip">Favorites</span>
        </div>
        
        <div className="icon-wrapper cart-icon-wrapper" onClick={toggleCart}>
            <FaShoppingCart className="nav-icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            <span className="tooltip">Cart</span>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;