import React from 'react';
import '../App.css'; 

function Hero() {
  return (
    <section className="hero" id="home">
      
        <h1>Taste the Magic in Every Slice!</h1>
        
        <p>
          Freshly baked with secret spices, overloaded with premium cheese, <br />
          and delivered piping hot to your doorstep.
        </p>

        <a href="#menu">
            <button>Order Now</button>
        </a>
        
    </section>
  );
}

export default Hero;