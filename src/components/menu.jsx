import React, { useState } from "react";
import { itemsData } from "../data/data";

function Menu({ openModel }){

    const [activeCategory, setActiveCategory] = useState("Pizza");

    const categories = [
        { name: "Pizza", icon: "🍕" },
        { name: "Side Items", icon: "🍟" },
        { name: "Beverages", icon: "🥤" },
        { name: "Desserts", icon: "🍰" },
        { name: "Combo Ideas", icon: "🍱" }
    ];

    const filteredItems = itemsData.filter(item => item.category === activeCategory);

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
                            color: activeCategory === cat.name ? 'black' : 'white',
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
                        <img src={item.image} alt={item.name}/>
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