import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import '../App.css';

function Reviews() {
  
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('pizzaReviews');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Suresh", rating: 5, text: "Supiri Pizza ekak! 🍕🔥" },
      { id: 2, name: "Nimali", rating: 4, text: "Delivery was fast. Good taste." },
    ];
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    text: ''
  });

  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    localStorage.setItem('pizzaReviews', JSON.stringify(reviews));
  }, [reviews]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStarClick = (ratingValue) => {
    setFormData({ ...formData, rating: ratingValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.text || formData.rating === 0) {
      toast.error("Please fill all fields & give stars!");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: formData.name,
      rating: formData.rating,
      text: formData.text
    };

    setReviews([newReview, ...reviews]);
    toast.success("Review Added Successfully!");
    setFormData({ name: '', email: '', rating: 0, text: '' });
  };

  return (
    <section className="reviews-section" id="reviews">
      <h2 className="section-title" style={{fontSize: '3rem'}}>Customer Reviews</h2>

      <div className="review-form-container">
        <h3 style={{marginBottom: '25px', fontSize: '1.5rem'}}>Write a Review</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row-top">
            <input 
              type="text" 
              name="name" 
              placeholder="Your Name" 
              value={formData.name} 
              onChange={handleChange} 
              className="input-field"
            />
            
            <div className="email-star-group">
                <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                value={formData.email} 
                onChange={handleChange} 
                className="input-field"
                />

                <div className="star-rating">
                {[...Array(5)].map((star, i) => {
                    const ratingValue = i + 1;
                    return (
                    <label key={i} style={{cursor:'pointer'}}>
                        <input 
                            type="radio" 
                            name="rating" 
                            value={ratingValue} 
                            onClick={() => handleStarClick(ratingValue)}
                            style={{display:'none'}}
                        />
                        <FaStar 
                            className="star" 
                            color={ratingValue <= formData.rating ? "#ffc107" : "#e4e5e9"} 
                            size={28}
                        />
                    </label>
                    );
                })}
                </div>
            </div>
          </div>

          <textarea 
            name="text" 
            placeholder="Share your experience..." 
            value={formData.text} 
            onChange={handleChange}
            className="textarea-field"
            rows="4"
          ></textarea>

          <div className="form-btn-row">
            <button type="submit" className="submit-btn">Add Review</button>
          </div>

        </form>
      </div>

      <div style={{textAlign: 'center', marginTop: '30px'}}>
        <button 
            className="see-reviews-btn" 
            onClick={() => setShowAllReviews(true)}
        >
            See Other Reviews
        </button>
      </div>

      {showAllReviews && (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxHeight: '85vh', overflowY: 'auto', maxWidth: '900px', width: '95%'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
                    <h2 style={{margin:0}}>What Others Say 🗣️</h2>
                    <button onClick={() => setShowAllReviews(false)} style={{background:'none', border:'none', fontSize:'1.8rem', cursor:'pointer', color:'#666'}}>
                        <FaTimes />
                    </button>
                </div>

                <div className="reviews-grid">
                    {reviews.length === 0 ? <p>No reviews yet.</p> : null}
                    
                    {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <strong>{review.name}</strong>
                            <div className="stars-display" style={{display:'flex'}}>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < review.rating ? "#ffc107" : "#ddd"} size={16}/>
                                ))}
                            </div>
                        </div>
                        <p className="review-text">"{review.text}"</p>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </section>
  );
}

export default Reviews;