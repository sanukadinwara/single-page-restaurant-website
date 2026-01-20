import React from "react";
import { FaShoppingCart } from "react-icons/fa";

function Navbar({ cartCount, onCartClick }){
    return(
        <nav className="navbar">
            <div className="nav-left">
                <h1>PizzaPalace 🍕</h1>
                <ul className="links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#menu">Menu</a></li>
                    <li><a href="#contact">Contact</a></li>
            </ul>
            </div>

                <div className="nav-right">            
                    <div className="cart-icon" onClick={onCartClick}>
                        <FaShoppingCart size={30}/>
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </div>
                </div>
            
        </nav>
        
    );
}

export default Navbar;