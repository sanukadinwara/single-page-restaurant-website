import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient'; // Supabase Link
import '../App.css';

function Reviews() {
  
  // 1. Reviews State (Database එකෙන් එන ඩේටා දාගන්න)
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Form Data State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    text: '' // Note: Database එකේ මේක 'message' විදිහට සේව් වෙන්නේ
  });

  const [showAllReviews, setShowAllReviews] = useState(false);

  // 3. Initial Data Load
  useEffect(() => {
    fetchReviews();
  }, []);

  // 4. Fetch Function
  const fetchReviews = async () => {
    try {
      let { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false }); // අලුත්ම ඒවා උඩට

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStarClick = (ratingValue) => {
    setFormData({ ...formData, rating: ratingValue });
  };

  // 5. Submit Handler (Database එකට යවන්න)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.text || formData.rating === 0) {
      toast.error("Please fill Name, Message & give Stars!");
      return;
    }

    const loadingToast = toast.loading("Submitting review...");

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          message: formData.text // UI එකේ 'text', DB එකේ 'message'
        }
      ]);

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success("Review Added Successfully! Thank you. ⭐");
      
      // Clear Form & Refresh List
      setFormData({ name: '', email: '', rating: 0, text: '' });
      fetchReviews(); 

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to submit review.");
      console.error(error);
    }
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
              placeholder="Your Name *" 
              value={formData.name} 
              onChange={handleChange} 
              className="input-field"
            />
            
            <div className="email-star-group">
                <input 
                type="email" 
                name="email" 
                placeholder="Your Email (Optional)" 
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
            placeholder="Share your experience... *" 
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
            See Other Reviews ({reviews.length})
        </button>
      </div>

      {/* --- REVIEWS POPUP --- */}
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
                    {loading && <p>Loading reviews...</p>}
                    {!loading && reviews.length === 0 && <p>No reviews yet. Be the first to write one!</p>}
                    
                    {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <FaUserCircle size={24} color="#888" />
                                <div>
                                    <strong>{review.name}</strong>
                                    <div style={{fontSize:'0.75rem', color:'#888'}}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="stars-display" style={{display:'flex'}}>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < review.rating ? "#ffc107" : "#ddd"} size={16}/>
                                ))}
                            </div>
                        </div>
                        {/* Note: DB uses 'message', Form uses 'text'. Here we display DB data */}
                        <p className="review-text">"{review.message}"</p>
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