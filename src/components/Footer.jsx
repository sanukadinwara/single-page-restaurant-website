import React, { useState } from 'react'; 
import { FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram } from 'react-icons/fa';
import {Toaster, toast} from 'react-hot-toast';
import { supabase } from '../supabaseClient';

function Footer() {
  
  const [email, setEmail] = useState("");

  const contactLinks = [
    { id: 1, icon: <FaPhoneAlt/>, text: "+94 77 123 4567", href: "tel:+94771234567" },
    { id: 2, icon: <FaEnvelope />, text: "info@pizzapalace.com", href: "mailto:info@pizzapalace.com" },
    { id: 3, icon: <FaFacebook />, text: "PizzaPalace LK", href: "https://facebook.com" },
    { id: 4, icon: <FaInstagram />, text: "@pizzapalace_lk", href: "https://instagram.com" }
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
        toast.error("Please enter a valid email!");
        return;
    }

    const { error } = await supabase
        .from('subscribers')
        .insert([{ email: email }]);

    if (error) {
        if (error.code === '23505') {
            toast.error("You are already subscribed! ✅");
        } else {
            console.error(error);
            toast.error("Subscription failed. Please try again.");
        }
    } else {
        toast.success(`Thank you! ${email} has been subscribed. 📩`);
        setEmail("");
    }
  };

  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        
        <div className="footer-flex-wrapper">
            
          <div className="footer-left-area">
            
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

            <div className="subscribe-section">
                <h3>Get Special Offers</h3>
                <p>Join our mailing list to get updates on new menu items and promo codes.</p>
                
                <form onSubmit={handleSubscribe} className="subscribe-form">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Subscribe</button>
                </form>
            </div>

          </div>

          <div className="footer-right-area">
            <h3>Our Location</h3>
            <div className="map-box">
              <iframe 
                title="Shop Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80385597899!2d79.82118599292886!3d6.92192257611585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk" 
                width="300"  
                height="300" 
                style={{ border: 0, borderRadius: "10px" }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>    

        </div>

        <div className="footer-bottom">
          <p>© 2026 PizzaPalace. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;