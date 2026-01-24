import React, { useState, useEffect } from 'react';
import '../App.css';

function Stats() {
  const [stats, setStats] = useState([
    { id: 1, label: "Happy Customers", value: 1000, current: 0, icon: "😊" },
    { id: 2, label: "Pizzas Delivered", value: 3000, current: 0, icon: "🍕" },
    { id: 3, label: "5 Star Ratings", value: 850, current: 0, icon: "⭐" },
    { id: 4, label: "Years of Service", value: 3, current: 0, icon: "🏆" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) => 
        prevStats.map((stat) => {
          if (stat.current < stat.value) {
            const increment = Math.ceil(stat.value / 100); 
            return { ...stat, current: Math.min(stat.current + increment, stat.value) };
          }
          return stat;
        })
      );
    }, 30); 

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number">
                {stat.current}
                {stat.value > 1000 ? '+' : ''} 
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;