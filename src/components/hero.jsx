import React from "react";

function Hero(){

    const scrollToMenu = () => {
        const menuSection = document.getElementById("menu");
        if (menuSection) {
            menuSection.scrollIntoView({behavior: "smooth"});
        }
    };

    return(
        <section id="home" className="hero">
            <div className="hero-content">
                <h1>Best Pizza in Town</h1>
                <p>Hot, Spicy & Cheesy!</p>
                <button onClick={scrollToMenu}>Order Now</button>
            </div>
        </section>
    );
}

export default Hero;