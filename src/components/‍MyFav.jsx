import React from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';

function Favorites({ favorites = [], menuItems = [], closeFavorites, toggleFavorite, addToCart }) {
  
  if (!menuItems || !Array.isArray(menuItems)) {
    return null; 
  }

  const favoriteItems = menuItems.filter(item => favorites.includes(item.id));

  return (
    <div className="modal-overlay">
      <div className="modal-content favorites-box" style={{maxHeight:'80vh', overflowY:'auto'}}>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2>My Favorites</h2>
          <button onClick={closeFavorites} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>
            <FaTimes />
          </button>
        </div>

        {favoriteItems.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px'}}>
                <p>No favorites yet!</p>
                <button onClick={closeFavorites} style={{marginTop:'10px', padding:'8px 15px', background:'#eee', border:'none', borderRadius:'5px'}}>Close</button>
            </div>
        ) : (
            favoriteItems.map((item) => (
              <div key={item.id} style={{display:'flex', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                
                <img 
                    src={item.image || "https://placehold.co/60x60?text=Pizza"} 
                    alt={item.name} 
                    style={{width: '60px', height: '60px', borderRadius: '5px', objectFit:'cover'}} 
                />
                
                <div style={{flex: 1, marginLeft: '15px', textAlign: 'left'}}>
                  <h4 style={{margin:0}}>{item.name}</h4>
                  <span style={{color:'#ff9f1c', fontWeight:'bold'}}>
                    Rs. {item.variants?.[0]?.price || item.price || 0}
                  </span>
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                   <button onClick={() => addToCart(item)} style={{background:'#ff9f1c', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px'}}>Add</button>
                   <button onClick={() => toggleFavorite(item.id)} style={{background:'none', border:'none', color:'red'}}><FaTrash /></button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Favorites;