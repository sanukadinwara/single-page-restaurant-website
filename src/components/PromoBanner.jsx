import React, { useState, useEffect } from 'react';
import '../App.css';

const offers = [
  {
    id: 1,
    title: "🔥 BUY 1 GET 1 FREE!",
    desc: "Order any Large Pizza & Get a Medium Pan Pizza Free!",
    code: "USE CODE: BOGO2026",
    image: "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    id: 2,
    title: "🥤 WEEKEND MEGA COMBO",
    desc: "2 Chicken Pizzas + 1.5L Coke + Garlic Bread = Rs. 4500",
    code: "LIMITED TIME OFFER",
    image: "https://images.pexels.com/photos/2619967/pexels-photo-2619967.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    id: 3,
    title: "🚚 FREE DELIVERY TODAY",
    desc: "Get free delivery on all orders above Rs. 2000",
    code: "NO CODE REQUIRED",
    image: "https://images.pexels.com/photos/4393668/pexels-photo-4393668.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    id: 4,
    title: "🌙 MIDNIGHT MADNESS",
    desc: "Hungry at night? Get 20% OFF on all orders after 8 PM!",
    code: "USE CODE: NIGHT20",
    image: "https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    id: 5,
    title: "🧀 CHEESE LOVERS DREAM",
    desc: "Triple Cheese Pizza with Stuffed Crust - Now Available!",
    code: "TRY IT NOW",
    image: "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    id: 6,
    title: "👨‍👩‍👧‍👦 THE FAMILY FEAST",
    desc: "2 Large Pizzas + Garlic Bread + 2L Coke for just Rs. 5500",
    code: "ORDER: FAMILY55",
    image: "https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    id: 7,
    title: "🥤 FREE COKE FRIDAY",
    desc: "Buy any Large Pizza and get a 1.5L Coke absolutely FREE!",
    code: "CODE: FREEDRINK",
    image: "https://images.pexels.com/photos/5903262/pexels-photo-5903262.jpeg?auto=compress&cs=tinysrgb&w=1600"
  }
];

function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 8000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="promo-container">
      <div 
        className="promo-slider" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {offers.map((offer) => (
          <div 
            key={offer.id} 
            className="promo-slide"
            style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${offer.image})` 
            }}
          >
            <div className="promo-content">
              <h2>{offer.title}</h2>
              <p>{offer.desc}</p>
              <span className="promo-code">{offer.code}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="promo-dots">
        {offers.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${currentIndex === idx ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default PromoBanner;