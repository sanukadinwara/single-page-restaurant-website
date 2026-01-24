import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaClipboardList, FaBars, FaTimes } from 'react-icons/fa';
import '../App.css';

const Navbar = ({ cartCount, toggleCart, toggleFavorites, toggleMyOrders }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Home ලින්ක් එක එබුවම උඩටම යන එක
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobile(false);
  };

  return (
    <nav className="navbar">
      
      {/* 1. වම් පැත්ත: මෙනු අයිකන් එක සහ ලෝගෝ එක */}
      <div className="nav-left">
        <button className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="logo" onClick={scrollToTop}>PizzaPalace 🍕</h1>
      </div>

      {/* 2. මැද: ලින්ක් ටික (CSS එකට අනුව Mobile View එක මාරු වෙනවා) */}
      <ul className={isMobile ? "nav-links-mobile" : "nav-links"} onClick={() => setIsMobile(false)}>
        <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
        <li><a href="#menu">About</a></li>
        <li><a href="#about">Menu</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      {/* 3. දකුණ: අයිකන් ටික */}
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