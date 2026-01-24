import React, { useState } from "react";
import { menuItems } from "../data/data";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function Menu({ openModel, favorites, toggleFavorite }){

    const [activeCategory, setActiveCategory] = useState("Pizza");

    const categories = [
        { name: "Pizza", icon: "🍕" },
        { name: "Side Items", icon: "🍟", },
        { name: "Beverages", icon: "🥤" },
        { name: "Desserts", icon: "🍰" },
        { name: "Combo Ideas", icon: "🍱" }
    ];

    const filteredItems = menuItems.filter(item => item.category === activeCategory);

    const handleOrder = (pizzaName, price) => {
        const phoneNumber = "94771234567";
        const message = `Hi! I want to order: ${pizzaName} (Rs. ${price.toFixed(2)})`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

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
                            color: 'black', 
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
                {filteredItems.map((item) => (
                    <div key={item.id} className="pizza-card">
                        <div className="image-container" style={{position: 'relative'}}>
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px 15px 0 0'}} 
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
                            <p>{item.desc}</p>
                            
                            <div className="price-tag">
                                From Rs. {item.variants[0].price.toFixed(2)}
                            </div>
                            
                            <div className="action-buttons">                            
                                <button 
                                    className="add-btn"
                                    onClick={() => openModel(item)}
                                    style={{width: '100%'}}
                                >
                                    Select Options ➕
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