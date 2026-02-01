import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaClipboardList, FaBars, FaTimes } from 'react-icons/fa';
import '../App.css';

const Navbar = ({ cartCount, toggleCart, toggleFavorites, toggleMyOrders }) => {
  const [isMobile, setIsMobile] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobile(false);
  };

  return (
    <nav className="navbar">
      
      <div className="nav-left">
        <button className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="logo" onClick={scrollToTop}>PizzaPalace 🍕</h1>
      </div>

      <ul className={isMobile ? "nav-links-mobile" : "nav-links"} onClick={() => setIsMobile(false)}>
        <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
        <li><a href="#about">About</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div className="nav-icons">
        <div className="icon-wrapper" onClick={toggleMyOrders}>
            <FaClipboardList className="nav-icon" />
        </div>

        <div className="icon-wrapper" onClick={toggleFavorites}>
            <FaHeart className="nav-icon" />
        </div>
        
        <div className="icon-wrapper cart-icon-wrapper" onClick={toggleCart}>
            <FaShoppingCart className="nav-icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;