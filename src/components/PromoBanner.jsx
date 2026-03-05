import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PromoBanner = () => {
  const [promos, setPromos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      let { data } = await supabase.from('promo_settings').select('*').order('id', { ascending: false });
      if (data) setPromos(data);
    };
    fetchBanners();

    const bannerSubscription = supabase
      .channel('realtime-banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_settings' }, () => {
          fetchBanners(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bannerSubscription);
    };
  }, []);

  useEffect(() => {
    if (promos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % promos.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [promos]);

  if (promos.length === 0) return null;

  return (
    <div className="promo-slider-container">
      {promos.map((banner, index) => {
        let position = "nextSlide"; 
        
        if (index === currentIndex) {
          position = "activeSlide"; 
        }
        
        if (
          index === currentIndex - 1 || 
          (currentIndex === 0 && index === promos.length - 1)
        ) {
          position = "lastSlide";  
        }

        return (
          <div 
            className={`promo-slide ${position}`} 
            key={banner.id}
          >
            <img src={banner.image_url} alt="Promo" className="promo-img" />
            <div className="promo-overlay-dark">
              <div className="promo-content">
                <h1 className="promo-heading-main">{banner.heading}</h1>
                <div className="sub-info-group">
                    <p className="promo-sub-text">{banner.sub_heading}</p>
                    {banner.promo_code && (
                        <div className="promo-code-badge">
                            <span>Use Code:</span>
                            <span className="code-text">{banner.promo_code}</span>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromoBanner;