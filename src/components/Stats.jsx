import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';

function Stats() {
  const [stats, setStats] = useState([
    { id: 1, label: "Happy Customers", value: 0, current: 0, icon: "😊" },
    { id: 2, label: "Pizzas Delivered", value: 0, current: 0, icon: "🍕" },
    { id: 3, label: "5 Star Ratings", value: 0, current: 0, icon: "⭐" },
    { id: 4, label: "Years of Service", value: 0, current: 0, icon: "🏆" }
  ]);

  useEffect(() => {
    fetchRealStats();

    const channel = supabase.channel('realtime-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchRealStats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRealStats = async () => {
    try {
      const { data: orders, error } = await supabase.from('orders').select('*');

      if (error || !orders) return;


      const uniqueCustomers = new Set(orders.map(o => o.customer_phone)).size;

      let totalPizzas = 0;
      orders.forEach(order => {
        if (Array.isArray(order.items)) {
            order.items.forEach(item => totalPizzas += (Number(item.quantity) || 0));
        }
      });

      const estimatedRatings = Math.floor(orders.length * 0.9);

      let yearsCount = 1;
      if (orders.length > 0) {
          const sortedOrders = orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          const firstDate = new Date(sortedOrders[0].created_at);
          const now = new Date();
          const diffTime = Math.abs(now - firstDate);
          const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365); 
          yearsCount = Math.floor(diffYears) < 1 ? 1 : Math.floor(diffYears);
      }

      setStats(prevStats => prevStats.map(stat => {
        if (stat.id === 1) return { ...stat, value: uniqueCustomers };
        if (stat.id === 2) return { ...stat, value: totalPizzas };
        if (stat.id === 3) return { ...stat, value: estimatedRatings };
        if (stat.id === 4) return { ...stat, value: yearsCount };
        return stat;
      }));

    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) => 
        prevStats.map((stat) => {
          if (stat.current < stat.value) {
            const increment = Math.ceil((stat.value - stat.current) / 20) || 1; 
            return { ...stat, current: Math.min(stat.current + increment, stat.value) };
          }
          return stat;
        })
      );
    }, 40);

    return () => clearInterval(interval);
  }, [stats]);

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number">
                {stat.current}
                {stat.id !== 4 ? '+' : ''}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;