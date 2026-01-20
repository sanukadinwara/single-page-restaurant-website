import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram } from 'react-icons/fa';

function Footer() {
  
  const contactLinks = [
    { id: 1, icon: <FaPhoneAlt/>, text: "+94 77 123 4567", href: "tel:+94771234567" },
    { id: 2, icon: <FaEnvelope />, text: "info@pizzapalace.com", href: "mailto:info@pizzapalace.com" },
    { id: 3, icon: <FaFacebook />, text: "PizzaPalace LK", href: "https://facebook.com" },
    { id: 4, icon: <FaInstagram />, text: "@pizzapalace_lk", href: "https://instagram.com" }
  ];

  return (
    <footer id="contact" className="footer">
      <div className="footer-container">
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="contact-list">
            
            {contactLinks.map((item) => (
              <li key={item.id}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <span className="icon">{item.icon}</span> 
                  {item.text}
                </a>
              </li>
            ))}

          </ul>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PizzaPalace. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;