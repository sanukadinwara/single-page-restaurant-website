import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaClipboardList, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { RiAdminFill } from "react-icons/ri";
import '../App.css';

const Navbar = ({ cartCount, toggleCart, toggleFavorites, toggleMyOrders, menuItems, setActiveCategory }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
        setSearchTerm(""); 
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobile(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = menuItems.filter((item) => 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (item) => {
    setActiveCategory(item.category);
    
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    }

    setSearchTerm("");
    setSuggestions([]);
    setShowSearch(false);
  };

  const handleSearchSubmit = () => {
    if (!searchTerm) return; 

    const match = menuItems.find(item => 
       item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (match) {
       setActiveCategory(match.category);
       const menuSection = document.getElementById('menu');
       if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
       
       setShowSearch(false);
       setSearchTerm("");
       setSuggestions([]);
    } else {
       console.log("No item found");
    }
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
        <div className="search-container" ref={searchRef} style={{position: 'relative'}}>
            
            {showSearch && (
                <input 
                  type="text" 
                  placeholder="Search Pizza, Coke, Lava Cake..." 
                  className="search-input-anim" 
                  value={searchTerm} 
                  onChange={handleSearchChange} 
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(); 
                    }
                  }}
                />
            )}

            {showSearch && suggestions.length > 0 && (
                <div className="suggestions-box">
                    {suggestions.map((item) => (
                        <div 
                            key={item.id} 
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(item)}
                        >
                            <img src={item.image_url || item.image} alt="" />
                            <div className="suggestion-info">
                                <span>{item.name}</span>
                                <small>{item.category}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div 
              className={`icon-wrapper ${showSearch ? "search-active-icon" : ""}`} 
              onClick={() => {
                  if (showSearch && searchTerm.length > 0) {
                      handleSearchSubmit();
                  } else {
                      setShowSearch(!showSearch);
                      if (!showSearch) { 
                        setSearchTerm(""); 
                        setSuggestions([]);
                      }
                  }
              }}
            >
            <FaSearch className="nav-icon" />
        </div>
      </div>

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

        <Link to="/admin" className="icon-wrapper">
            <RiAdminFill className="nav-icon" />
        </Link>
      </div>

    </nav>
  );
};

export default Navbar;