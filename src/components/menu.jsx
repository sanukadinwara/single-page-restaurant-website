import React from "react";
import { pizzaData } from "../data/data";

function Menu(){
    const handleOrder = (pizzaName, price) => {
        const phoneNumber = "0123456789";
        const message = `Hi! I want to order: ${pizzaName} (Rs. ${price})`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return(
        <section id="menu" className="menu-section">
            <h2>Our Menu</h2>
            <div className="menu-container">
                {pizzaData.map((pizza) => (
                    <div key={pizza.id} className="pizza-card">
                        <img src={pizza.image} alt={pizza.name}/>
                        <div className="card-body">
                            <h3>{pizza.name}</h3>
                            <p>{pizza.desc}</p>
                            <div className="price-row">
                                <span className="price">Rs. {pizza.price}</span>
                                <button onClick={() => handleOrder(pizza.name, pizza.price)}>
                                    Order via Whatsapp
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