import React from 'react';
import { FaTimes, FaShoppingBag, FaClock, FaCheckCircle, FaMotorcycle, FaUtensils } from 'react-icons/fa';
import '../App.css';

const MyOrders = ({ orders, closeMyOrders }) => {
  
  const getStatusInfo = (status) => {
      switch (status) {
          case 'Pending': return { color: '#f39c12', icon: <FaClock />, label: 'Pending' };
          case 'Cooking': return { color: '#d35400', icon: <FaUtensils />, label: 'Cooking' };
          case 'Ready': return { color: '#2980b9', icon: <FaCheckCircle />, label: 'Ready' };
          case 'Delivered': return { color: '#27ae60', icon: <FaMotorcycle />, label: 'Delivered' };
          case 'Completed': return { color: '#2c3e50', icon: <FaCheckCircle />, label: 'Completed' };
          default: return { color: '#7f8c8d', icon: <FaClock />, label: status || 'Pending' };
      }
  };

  const sortedOrders = [...orders].reverse();

  return (
    <div className="modal-overlay">
      <div className="modal-content my-orders-box" style={{maxHeight:'85vh', overflowY:'auto'}}>
        
        <div className="favorites-header" style={{borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>
          <h2 style={{margin:0}}>My Orders 📦</h2>
          <button className="close-btn-fav" onClick={closeMyOrders}>✖</button>
        </div>

        <div className="orders-list-body">
          {sortedOrders.length === 0 ? (
            <div className="empty-cart" style={{textAlign:'center', padding:'40px', color:'#999'}}>
              <FaShoppingBag style={{fontSize: '3rem', marginBottom: '15px', color: '#ddd'}}/>
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            sortedOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);

              return (
                <div key={order.id} className="order-card" style={{border:'1px solid #eee', borderRadius:'10px', padding:'15px', marginBottom:'15px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  
                  <div className="order-card-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <span style={{fontWeight:'bold', fontSize:'1.1rem'}}>#{order.id}</span>
                    <span style={{
                        backgroundColor: `${statusInfo.color}20`, 
                        color: statusInfo.color, 
                        padding: '5px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>

                  <div style={{fontSize:'0.85rem', color:'#777', marginBottom:'10px'}}>
                    <FaClock style={{marginRight:'5px'}}/> {order.date}
                  </div>

                  <div style={{background:'#f9f9f9', padding:'10px', borderRadius:'8px', fontSize:'0.95rem'}}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                        <span>{item.name} <small style={{color:'#666'}}>x{item.quantity}</small></span>
                        <span style={{fontWeight:'500'}}>Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'space-between', marginTop:'15px', borderTop:'1px dashed #ddd', paddingTop:'10px', fontWeight:'bold', fontSize:'1.1rem'}}>
                    <span>Total Amount</span>
                    <span style={{color:'#d35400'}}>Rs. {Number(order.total).toFixed(2)}</span>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default MyOrders;