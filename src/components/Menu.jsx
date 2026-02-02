import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function Menu({ menuItems, openModel, favorites, toggleFavorite, isShopOpen, activeCategory, setActiveCategory }){

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (menuItems && menuItems.length > 0) {
            setLoading(false);
        } else {
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [menuItems]);

    const categories = [
        { name: "Pizza", icon: "🍕" },
        { name: "Side Items", icon: "🍟", },
        { name: "Beverages", icon: "🥤" },
        { name: "Desserts", icon: "🍰" },
        { name: "Combo Ideas", icon: "🍱" }
    ];

    const filteredItems = menuItems.filter(item => 
        item.category?.toLowerCase() === activeCategory.toLowerCase()
    );

    if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
    }

    return(
        <section id="menu" className="menu-section">
            <h2>Our Menu</h2>

            <div className="category-container" style={{display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px'}}>
                {categories.map((cat) => (
                    <button 
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        style={{
                            padding: '8px 15px',
                            borderRadius: '20px',
                            border: '1px solid #ff9f1c',
                            background: activeCategory === cat.name ? '#ff9f1c' : 'transparent',
                            color: activeCategory === cat.name ? '#333333' : '#333333', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            <div className="menu-container">
                
                {menuItems.length === 0 && (
                    <p style={{color:'white', textAlign:'center'}}>Loading Menu...</p>
                )}

                {menuItems.length > 0 && filteredItems.length === 0 && (
                    <p style={{color:'white', textAlign:'center'}}>
                        No items found in {activeCategory}. <br/>
                        (Check Database Category Names)
                    </p>
                )}

                {filteredItems.map((item) => (
                    <div key={item.id} className="pizza-card">
                        <div className="image-container" style={{position: 'relative'}}>
                            <img 
                                src={item.image_url || item.image} 
                                alt={item.name} 
                                style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px 15px 0 0'}} 
                                onError={(e) => {e.target.src = 'https://via.placeholder.com/300?text=No+Image'}}
                            />
                            
                            <button 
                                className="heart-btn" 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    toggleFavorite(item.id);
                                }}
                            >
                                {favorites.includes(item.id) ? 
                                    <FaHeart color="red" size={20} /> : 
                                    <FaRegHeart color="gray" size={20} />
                                }
                            </button>
                        </div>

                        <div className="card-body">
                            <h3>{item.name}</h3>
                            <p className="pizza-desc">
                                {item.description || item.desc || "No description available"}
                            </p>
                            
                            <div className="price-tag">
                                {item.variants && item.variants.length > 0 ? (
                                    `From Rs. ${Number(item.variants[0].price).toFixed(2)}`
                                ) : (
                                    `Rs. ${item.price ? Number(item.price).toFixed(2) : "0.00"}`
                                )}
                            </div>
                            
                            <div className="action-buttons">                            
                                <button 
                                    className="add-btn" 
                                    onClick={() => openModel(item)} 
                                    disabled={!isShopOpen} 
                                    style={{
                                        width: '100%', 
                                        backgroundColor: isShopOpen ? '#ffca28' : '#555',
                                        cursor: isShopOpen ? 'pointer' : 'not-allowed',
                                        color: isShopOpen ? 'black' : '#ccc'
                                    }}
                                >
                                    {isShopOpen ? 'Add to Cart ➕' : 'Shop Closed 🔒'}
                                </button>
                            </div>
                        </div>
                    </div>    
                ))}
            </div>
        </section>
    );
}

export default Menu;