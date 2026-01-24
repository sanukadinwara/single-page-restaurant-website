import React from 'react';
import { FaShoppingCart, FaHeart, FaClipboardList } from 'react-icons/fa';
import '../App.css'; 

function Navbar({ cartCount, onCartClick, favoriteCount, onFavClick, onOrdersClick }) {
  return (
    <nav className="navbar">
      
      <div className="nav-left">
        <h1>PizzaPalace 🍕</h1>
      </div>

      <ul className="links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li><a href="#footer">Contact</a></li> 
      </ul>

      <div className="nav-right">
        
        <div className="nav-icon" onClick={onOrdersClick} style={{marginRight: '20px'}} title="My Orders">
            <FaClipboardList size={22} />
        </div>

        <div className="nav-icon" onClick={onFavClick} style={{marginRight: '20px'}} title="Favorites">
          <FaHeart size={24} />
          {favoriteCount > 0 && <span className="icon-badge">{favoriteCount}</span>}
        </div>

        <div className="nav-icon" onClick={onCartClick} title="Cart">
            <FaShoppingCart size={24} />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
        </div>
      </div>

    </nav>
  );
}

export default Navbar;