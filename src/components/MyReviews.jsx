import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaUserCircle, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import '../App.css';

function Reviews() {
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    text: ''
  });

  const [showAllReviews, setShowAllReviews] = useState(false);

  const [myReviewIds, setMyReviewIds] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    fetchReviews();
    const savedIds = JSON.parse(localStorage.getItem('my_reviews')) || [];
    setMyReviewIds(savedIds);
  }, []);

  const fetchReviews = async () => {
    try {
      let { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return; 

    const loadingToast = toast.loading("Deleting...");
    
    const { error } = await supabase.from('reviews').delete().eq('id', reviewToDelete);
    
    if (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete.");
      return;
    }
    
    toast.dismiss(loadingToast);
    toast.success("Review deleted successfully!");
    
    const updatedIds = myReviewIds.filter(revId => revId !== reviewToDelete);
    setMyReviewIds(updatedIds);
    localStorage.setItem('my_reviews', JSON.stringify(updatedIds));
    
    setReviewToDelete(null); 
    fetchReviews();
  };

  const handleEditClick = (review) => {
    setEditingId(review.id);
    setFormData({
      name: review.name,
      email: review.email || '',
      rating: review.rating,
      text: review.message 
    });
    setShowAllReviews(false); 
    
    document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStarClick = (ratingValue) => {
    setFormData({ ...formData, rating: ratingValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.text || formData.rating === 0) {
      toast.error("Please fill Name, Message & Give Stars!");
      return;
    }

    const loadingToast = toast.loading(editingId ? "Updating review..." : "Submitting review...");

    try {
      if (editingId) {
        const { error } = await supabase.from('reviews').update({
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          message: formData.text
        }).eq('id', editingId);

        if (error) throw error;
        toast.dismiss(loadingToast);
        toast.success("Review Updated Successfully!");
        setEditingId(null);

      } else {
        const { data, error } = await supabase.from('reviews').insert([
          {
            name: formData.name,
            email: formData.email,
            rating: formData.rating,
            message: formData.text
          }
        ]).select(); 

        if (error) throw error;

        if (data && data.length > 0) {
          const newId = data[0].id;
          const updatedIds = [...myReviewIds, newId];
          setMyReviewIds(updatedIds);
          localStorage.setItem('my_reviews', JSON.stringify(updatedIds));
        }

        toast.dismiss(loadingToast);
        toast.success("Review Added Successfully! Thank you.");
      }
      
      setFormData({ name: '', email: '', rating: 0, text: '' });
      fetchReviews(); 

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save review.");
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

          <div className="form-btn-row" style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'15px'}}>
            {editingId && (
                <button type="button" className="cancel-btn-admin" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', rating: 0, text: '' }); }} style={{padding:'10px 20px', borderRadius:'5px', border:'none', cursor:'pointer', background:'#ccc', color:'#000'}}>
                    Cancel Edit
                </button>
            )}
            <button type="submit" className="submit-btn">{editingId ? "Update Review" : "Add Review"}</button>
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
                        <p className="review-text">"{review.message}"</p>
                        {myReviewIds.map(String).includes(String(review.id)) && (
                            <div style={{display:'flex', gap:'15px', marginTop:'10px', borderTop:'1px dashed #ddd', paddingTop:'10px'}}>
                                <button onClick={() => handleEditClick(review)} style={{background:'none', border:'none', color:'#2980b9', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.85rem'}}>
                                    <FaEdit /> Edit
                                </button>
                                <button 
                                  onClick={() => setReviewToDelete(review.id)} 
                                  style={{background:'none', border:'none', color:'#d32f2f', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.85rem'}}
                                >
                                  <FaTrashAlt /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {reviewToDelete && (
        <div className="modal-overlay" style={{zIndex: 3000}}>
            <div className="modal-content fade-in" style={{maxWidth: '400px', textAlign: 'center', padding: '30px', borderRadius: '15px'}}>
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>⚠️</div>
                <h3 style={{marginBottom: '10px', color: '#333'}}>Delete Review?</h3>
                <p style={{color: '#666', marginBottom: '25px'}}>Are you sure you want to permanently delete this review? This action cannot be undone.</p>
                <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
                    <button 
                        onClick={() => setReviewToDelete(null)} 
                        style={{flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#e0e0e0', color: '#333', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteReview} 
                        style={{flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#d32f2f', color: '#fff', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
      )}

    </section>
  );
}

export default Reviews;