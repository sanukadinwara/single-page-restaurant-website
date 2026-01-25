import React from 'react';
import { FaTimes, FaShoppingBag, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import '../App.css';

const MyOrders = ({ orders, closeMyOrders }) => {
  
  // ඕඩර්ස් අලුත් එකේ ඉඳන් පරණ එකට පෙළගස්වන්න (Reverse)
  const sortedOrders = [...orders].reverse();

  return (
    <div className="modal-overlay">
      <div className="modal-content my-orders-box">
        
        <div className="favorites-header">
          <h2>My Past Orders</h2>
          <button className="close-btn-fav" onClick={closeMyOrders}>✖</button>
        </div>

        <div className="orders-list-body">
          {sortedOrders.length === 0 ? (
            <div className="empty-cart">
              <FaShoppingBag style={{fontSize: '3rem', marginBottom: '15px', color: '#ddd'}}/>
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            sortedOrders.map((order) => (
              <div key={order.id} className="order-card">
                
                {/* 1. Header Row (Order ID & Status) */}
                <div className="order-card-header">
                  <span className="order-id">#{order.id}</span>
                  <span className="order-status">Pending</span>
                </div>

                {/* 2. Date & Time */}
                <div className="order-meta">
                  <FaClock className="meta-icon"/> {order.date} at {order.time}
                </div>

                {/* 3. Items List (Box inside Box) */}
                <div className="order-items-box">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span>{item.name} <small>x {item.quantity}</small></span>
                      <span>Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* 4. Total Amount Footer */}
                <div className="order-card-footer">
                  <span>Total Amount</span>
                  <span className="order-total-price">Rs. {order.total.toFixed(2)}</span>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default MyOrders;