import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PromoBanner = () => {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    let { data, error } = await supabase
        .from('promo_settings')
        .select('*')
        .limit(1)
        .single();
    
    if (data) {
        setBanner(data);
    }
  };

  if (!banner) return null; 

  return (
    <div className="promo-banner" style={{ backgroundImage: `url(${banner.image_url})` }}>
      <div className="promo-overlay">
        <div className="promo-content">
          <h1>{banner.heading}</h1>
          <p>{banner.sub_heading}</p>
          <div className="promo-code-box">
            <span>Use Code:</span>
            <span className="code">{banner.promo_code}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;