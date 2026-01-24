import React, { useEffect, useState, useRef } from 'react';

function About() {
  const [isVisible, setIsVisible] = useState(false); 
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false); 
          }
        });
      },
      { threshold: 0.3 } 
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="about-container">
        
        <div className="about-text">
          <h2>About Us</h2>
          <p>
            Welcome to PizzaPalace! We started with a simple mission: to make the most delicious, 
            mouth-watering pizzas using only the freshest ingredients. Our secret recipe sauce 
            and hand-tossed dough have been bringing smiles to our customers for over 10 years.
          </p>
          <p>
            Whether you love spicy pepperoni or fresh veggies, we have something for everyone. 
            Come taste the love in every slice!
          </p>
        </div>

        <div className={`about-image ${isVisible ? 'slide-in' : ''}`}>
          <img 
            src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Delicious Pizza" 
          />
        </div>

      </div>
    </section>
  );
}

export default About;