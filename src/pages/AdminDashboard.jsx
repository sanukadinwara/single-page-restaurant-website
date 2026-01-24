import React, { useState } from 'react';
import '../App.css'; 
import { toast } from 'react-hot-toast';

// Icons Imports
import { IoBarChartSharp, IoStatsChart, IoLogOut, IoFlashSharp, IoTime } from "react-icons/io5"; 
import { FaBoxOpen, FaPizzaSlice, FaScroll, FaPlusSquare, FaClipboardList, FaCloudUploadAlt, FaCalendarAlt, FaImages } from "react-icons/fa";
import { MdOutlineMenuBook, MdWavingHand, MdStorefront } from "react-icons/md";
import { FaPencil, FaTrash } from "react-icons/fa6";

// Chart JS Imports
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); 

  // --- States for Menu Form ---
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Pizza');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(''); 
  const [imagePreview, setImagePreview] = useState(null); 
  const [variants, setVariants] = useState([{ name: '', price: '' }]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- States for Orders ---
  const [orderSearch, setOrderSearch] = useState('');
  const [showReceivedModal, setShowReceivedModal] = useState(false);
  const [receivedId, setReceivedId] = useState(null);
  
  // --- States for Charts ---
  const [salesView, setSalesView] = useState('Weekly');
  const [productView, setProductView] = useState('Weekly');

  // --- States for Promo Banner ---
  const [promoImage, setPromoImage] = useState('');
  const [promoHeading, setPromoHeading] = useState('HOT & SPICY');
  const [promoSub, setPromoSub] = useState('Pizza of the Month');
  const [promoCode, setPromoCode] = useState('GET20OFF');
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);

  // --- States for Store Hours & Holiday ---
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [isHolidayActive, setIsHolidayActive] = useState(false);

  // --- MOCK DATA ---
  const [menuList, setMenuList] = useState([
    { id: 1, category: "Pizza", name: "Tandoori Chicken", desc: "Tender chicken...", image: "https://adminsc.pizzahut.lk//images/mainmenu/209e7feb-7c0b-4fc4-8019-ab2a9e3406a9.jpg", variants: [{ name: "Small", price: 1200 }, { name: "Medium", price: 1900 }, { name: "Large", price: 2800 }] },
    { id: 2, category: "Pizza", name: "Pepperoni Feast", desc: "Loaded pepperoni...", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000", variants: [{ name: "Small", price: 1200 }, { name: "Medium", price: 1900 }, { name: "Large", price: 2800 }] },
    { id: 3, category: "Beverages", name: "Coca Cola", desc: "Chilled soft drink", image: "https://images.unsplash.com/photo-1624552184280-9e9631bbeee9", variants: [{ name: "400ml", price: 150 }, { name: "1L", price: 350 }] }
  ]);

  const [orders, setOrders] = useState([
    { id: 1001, date: "2026-01-23", time: "10:30 AM", customer: "Tony Stark", phone: "077-1234567", address: "No 5, Main St, Nugegoda", items: "Tandoori Chicken (L) x 1, Coke x 2", total: 3100, status: "Pending" },
    { id: 1002, date: "2026-01-23", time: "11:15 AM", customer: "Natasha Romanoff", phone: "071-9876543", address: "24/B, Temple Rd, Maharagama", items: "Veggie Supreme (M) x 1", total: 1600, status: "Cooking" },
    { id: 1003, date: "2026-01-23", time: "12:00 PM", customer: "Steve Rogers", phone: "076-5554441", address: "Wifi Zone, Colombo 07", items: "Cheese Pizza (S) x 2, Garlic Bread", total: 2450, status: "Delivered" },
    { id: 998, date: "2026-01-22", time: "08:00 PM", customer: "Peter Parker", phone: "070-1112223", address: "Kottawa", items: "BBQ Chicken (L)", total: 2800, status: "Received" },
    { id: 828, date: "2025-12-28", time: "07:10 PM", customer: "Bruce Banner", phone: "070-1122334", address: "Havelock Town", items: "Tandoori Chicken (L)", total: 2800, status: "Received" }
  ]);

  // --- HELPER FUNCTIONS ---
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadToast = toast.loading("Uploading Image...");
    if (type === 'promo') setIsUploadingPromo(true);

    setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file); 
        if (type === 'menu') { setImage(fakeUrl); setImagePreview(fakeUrl); } 
        else if (type === 'promo') { setPromoImage(fakeUrl); setIsUploadingPromo(false); }
        toast.dismiss(uploadToast);
        toast.success("Image Uploaded Successfully!");
    }, 1500);
  };

  const setHolidayMode = () => {
    if (!holidayStart || !holidayEnd) return toast.error("Please select both start and end times!");
    setIsHolidayActive(true);
    toast.success("Holiday Mode Activated!");
  };

  const clearHolidayMode = () => {
    setIsHolidayActive(false); setHolidayStart(''); setHolidayEnd(''); toast("Holiday Mode Cleared");
  };

  // --- CHART DATA ---
  const getSalesChartData = () => {
    let labels = [];
    let data = [];

    if (salesView === 'Weekly') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = [15000, 22000, 18000, 25000, 30000, 45000, 40000];
    } else if (salesView === 'Monthly') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      data = [120000, 145000, 130000, 160000];
    } else if (salesView === 'Yearly') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = [450000, 520000, 480000, 550000, 600000, 750000, 800000, 700000, 650000, 720000, 850000, 950000];
    }

    return {
      labels,
      datasets: [{
        label: `Sales (${salesView}) - LKR`,
        data: data,
        backgroundColor: '#ff9f1c',
        borderRadius: 5,
      }]
    };
  };

  const getProductChartData = () => {
    let data = [];
    if (productView === 'Weekly') {
      data = [45, 25, 20, 15, 10];
    } else if (productView === 'Monthly') {
      data = [200, 150, 180, 90, 60];
    } else if (productView === 'Yearly') {
      data = [2500, 1800, 2200, 1200, 800];
    }

    return {
      labels: ['Chicken Pizza', 'Veggie Pizza', 'Coke', 'Garlic Bread', 'Lava Cake'],
      datasets: [{
        data: data,
        backgroundColor: ['#ff9f1c', '#1a1a1a', '#d32f2f', '#28a745', '#888888'],
        borderWidth: 1,
      }]
    };
  };

  // --- CRUD & ORDER LOGIC ---
  const resetForm = () => { setItemName(''); setCategory('Pizza'); setDesc(''); setImage(''); setImagePreview(null); setVariants([{ name: '', price: '' }]); setIsEditing(false); setCurrentId(null); };
  const handleVariantChange = (index, field, value) => { const newVariants = [...variants]; newVariants[index][field] = value; setVariants(newVariants); };
  const addVariant = () => setVariants([...variants, { name: '', price: '' }]);
  const removeVariant = (index) => { const newVariants = variants.filter((_, i) => i !== index); setVariants(newVariants); };
  const handleDeleteClick = (id) => { setDeleteId(id); setShowDeleteModal(true); };
  const confirmDelete = () => { setMenuList(menuList.filter(item => item.id !== deleteId)); setShowDeleteModal(false); setDeleteId(null); toast.success("Item Deleted Successfully! 🗑️"); };
  const handleEdit = (item) => { setIsEditing(true); setCurrentId(item.id); setItemName(item.name); setCategory(item.category); setImage(item.image); setImagePreview(item.image); setDesc(item.desc || ''); setVariants(item.variants); toast("Editing Mode On", { icon: '✏️' }); };
  const handleSave = () => {
    if (!itemName) return toast.error("Item Name is required!");
    if (!image) return toast.error("Please upload an image!");
    const newItemData = { name: itemName, category, desc, image, variants };
    if (isEditing) { setMenuList(menuList.map(item => item.id === currentId ? { ...item, ...newItemData } : item)); toast.success("Item Updated!"); } 
    else { setMenuList([...menuList, { id: Date.now(), ...newItemData }]); toast.success("New Item Added!"); }
    resetForm();
  };
  const handleStatusChange = (id, newStatus) => { const statusToSet = newStatus === 'Received' ? 'Pending_Received' : newStatus; setOrders(orders.map(order => order.id === id ? { ...order, status: statusToSet } : order)); };
  const saveOrderStatus = (id) => { const order = orders.find(o => o.id === id); if (order.status === 'Pending_Received') { setReceivedId(id); setShowReceivedModal(true); } else { toast.success(`Order #${id} updated!`); } };
  const confirmReceived = () => { setOrders(orders.map(o => o.id === receivedId ? { ...o, status: 'Received' } : o)); setShowReceivedModal(false); setReceivedId(null); toast.success("Order moved to History!"); };
  const cancelReceived = () => { setOrders(orders.map(o => o.id === receivedId ? { ...o, status: 'Delivered' } : o)); setShowReceivedModal(false); setReceivedId(null); toast("Returned to Delivered"); };

  const activeOrders = orders.filter(o => o.status !== 'Received');
  const pastOrders = orders.filter(o => o.status === 'Received');
  const filteredPastOrders = pastOrders.filter(order => {
      const search = orderSearch.toLowerCase();
      return (order.customer.toLowerCase().includes(search) || order.phone.includes(search) || order.id.toString().includes(search));
  });

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => {
    const uniqueCustomers = new Set(orders.map(o => o.customer.trim() + o.phone.trim())).size;
    return (
        <div className="admin-content fade-in">
        <h2><MdWavingHand /> Welcome Back, Admin!</h2>
        <div className="stats-grid">
            <div className="admin-card"><h3>Total Orders</h3><p>150</p></div>
            <div className="admin-card"><h3>Total Earnings</h3><p>Rs. 450,000</p></div>
            <div className="admin-card"><h3>Pending Orders</h3><p className="highlight">{activeOrders.filter(o => o.status === 'Pending').length}</p></div>
            <div className="admin-card"><h3>Total Customers</h3><p>{uniqueCustomers}</p></div>
        </div>

        <div className="charts-container">
            <div className="chart-card bar-chart">
                <div className="chart-header">
                    <div className="chart-title-group"><IoStatsChart className="chart-icon" /><h3>Sales Overview</h3></div>
                    <select className="chart-filter" value={salesView} onChange={(e) => setSalesView(e.target.value)}>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>
                <Bar data={getSalesChartData()} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="chart-card pie-chart">
                <div className="chart-header">
                    <div className="chart-title-group"><FaPizzaSlice className="chart-icon" /><h3>Best Sellers</h3></div>
                    <select className="chart-filter" value={productView} onChange={(e) => setProductView(e.target.value)}>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>
                <div className="pie-wrapper"><Pie data={getProductChartData()} /></div>
            </div>
        </div>

        <div className="settings-grid">
            <div className="settings-card promo-section">
                <div className="section-header"><FaImages className="section-icon" /><h3>Promo Banner Manager</h3></div>
                <div className="upload-box">
                    <input type="file" id="promo-upload" hidden onChange={(e) => handleImageUpload(e, 'promo')} />
                    <label htmlFor="promo-upload" className="upload-label">
                        {promoImage ? <img src={promoImage} alt="Promo" className="promo-preview-img" /> : <div className="placeholder-content"><FaCloudUploadAlt className="upload-icon-large" /><span>Click to Upload Banner</span></div>}
                    </label>
                </div>
                <div className="promo-inputs">
                    <div className="form-group"><label>Banner Heading</label><input type="text" className="admin-input" value={promoHeading} onChange={(e) => setPromoHeading(e.target.value)} /></div>
                    <div className="form-group"><label>Sub Heading</label><input type="text" className="admin-input" value={promoSub} onChange={(e) => setPromoSub(e.target.value)} /></div>
                    <div className="form-group"><label>Promo Code</label><input type="text" className="admin-input highlight-input" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} /></div>
                </div>
                <div className="form-actions">
                    <button className="cancel-btn-admin" onClick={() => { setPromoImage(''); setPromoHeading(''); setPromoSub(''); setPromoCode(''); toast.success("Banner Removed") }}>Delete Banner</button>
                    <button className="admin-btn-save" onClick={() => toast.success("Banner Updated Successfully!")}>Update Banner</button>
                </div>
            </div>

            <div className="settings-card store-section">
                <div className="section-header"><MdStorefront className="section-icon" /><h3>Store Operating Hours</h3></div>
                <div className="hours-block">
                    <h4><IoTime /> Daily Schedule</h4>
                    <div className="time-inputs">
                        <div className="time-group"><label>Open Time</label><input type="time" className="admin-input" value={openTime} onChange={(e) => setOpenTime(e.target.value)} /></div>
                        <div className="time-group"><label>Close Time</label><input type="time" className="admin-input" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} /></div>
                    </div>
                    <button className="save-status-btn" onClick={() => toast.success(`Hours Updated!`)}>Save Daily Hours</button>
                </div>
                <hr className="divider" />
                <div className="holiday-block">
                    <h4><FaCalendarAlt /> Holiday / Temporary Closure</h4>
                    <div className="date-inputs">
                        <div className="form-group"><label>Start</label><input type="datetime-local" className="admin-input" value={holidayStart} onChange={(e) => setHolidayStart(e.target.value)} /></div>
                        <div className="form-group"><label>End</label><input type="datetime-local" className="admin-input" value={holidayEnd} onChange={(e) => setHolidayEnd(e.target.value)} /></div>
                    </div>
                    {isHolidayActive ? (
                        <div className="holiday-active-msg">
                            <p>⚠️ <b>Store Closed:</b> {formatDateTime(holidayStart)} to {formatDateTime(holidayEnd)}</p>
                            <button className="remove-btn-small" style={{width: '100%', marginTop: '10px'}} onClick={clearHolidayMode}>End Holiday Mode</button>
                        </div>
                    ) : (
                        <button className="admin-btn-save" style={{background: '#d32f2f'}} onClick={setHolidayMode}>Activate Holiday Mode</button>
                    )}
                    {isHolidayActive && (
                        <div className="preview-msg-box">
                            <h5>Message Preview:</h5>
                            <p>"Due to unavoidable reasons, the store will be closed from <b>{formatDateTime(holidayStart)}</b> to <b>{formatDateTime(holidayEnd)}</b>. We apologize for any inconvenience caused."</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
  };

  const renderOrders = () => (
    <div className="admin-content fade-in">
      <h2><FaBoxOpen /> Manage Orders</h2>
      <h3 className="section-title"><IoFlashSharp /> Active Orders</h3>
      <div className="table-container mb-40">
        <table className="admin-table">
            <thead>
            <tr>
                <th style={{width: '60px'}}>ID</th>
                <th style={{width: '150px'}}>Date & Time</th>
                <th style={{width: '250px'}}>Customer Details</th>
                <th>Items & Total</th>
                <th style={{width: '180px'}}>Status</th>
                <th style={{width: '100px'}}>Action</th>
            </tr>
            </thead>
            <tbody>
            {activeOrders.map(order => (
                <tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
                <td><div className="date-time-box"><div className="date-text">{order.date}</div><div className="time-text">{order.time}</div></div></td>
                <td><div className="customer-box"><div className="cust-name">{order.customer}</div><div className="cust-phone"><a href={`tel:${order.phone}`}>{order.phone}</a></div><div className="cust-addr">{order.address}</div></div></td>
                <td><div className="items-box"><div className="item-list">{order.items}</div><div className="price-tag-large">Rs. {order.total}</div></div></td>
                <td>
                    <select className={`status-select ${order.status === 'Pending_Received' ? 'received' : order.status.toLowerCase()}`} value={order.status === 'Pending_Received' ? 'Received' : order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="Pending">New Order</option><option value="Cooking">Cooking</option><option value="Ready">Ready</option><option value="Delivered">Delivered</option><option value="Received">Received</option>
                    </select>
                </td>
                <td><button className="save-status-btn" onClick={() => saveOrderStatus(order.id)}>Save</button></td>
                </tr>
            ))}
            {activeOrders.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No active orders!</td></tr>}
            </tbody>
        </table>
      </div>
      <div className="list-header" style={{marginTop: '40px', borderBottom: 'none'}}>
          <h3 className="section-title"><FaScroll /> Past Orders</h3>
          <input type="text" placeholder="🔍 Search History..." className="search-input" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
      </div>
      <div className="table-container">
        <table className="admin-table">
            <thead>
            <tr><th style={{width: '60px'}}>ID</th><th style={{width: '150px'}}>Date & Time</th><th style={{width: '250px'}}>Customer Details</th><th>Items & Total</th><th style={{width: '150px'}}>Status</th></tr>
            </thead>
            <tbody>
            {filteredPastOrders.map(order => (
                <tr key={order.id} className="past-order-row">
                <td><strong>#{order.id}</strong></td>
                <td><div className="date-time-box"><div className="date-text">{order.date}</div><div className="time-text">{order.time}</div></div></td>
                <td><div className="customer-box"><div className="cust-name">{order.customer}</div><div className="cust-phone">{order.phone}</div><div className="cust-addr">{order.address}</div></div></td>
                <td><div className="items-box"><div className="item-list">{order.items}</div><div className="price-tag-large" style={{fontSize: '1rem', color: '#555'}}>Rs. {order.total}</div></div></td>
                <td><span className="status-badge completed">Completed</span></td>
                </tr>
            ))}
            {filteredPastOrders.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#888'}}>No past orders found.</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="admin-content fade-in">
      <h2><MdOutlineMenuBook /> Menu Management</h2>
      <div className="menu-grid-layout">
        <div className="add-menu-form">
            <h3 className="form-title">
              {isEditing ? <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaPencil /> Update Item</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaPlusSquare /> Add New Item</span>}
            </h3>
            <div className="form-group"><label>Item Name</label><input type="text" placeholder="Item Name" className="admin-input" value={itemName} onChange={(e) => setItemName(e.target.value)} /></div>
            <div className="form-row">
                <div className="form-group"><label>Category</label><select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="Pizza">Pizza</option><option value="Side Items">Side Items</option><option value="Beverages">Beverages</option></select></div>
                <div className="form-group">
                    <label>Item Image</label>
                    <div className="menu-upload-wrapper">
                        <input type="file" id="menu-img-upload" hidden onChange={(e) => handleImageUpload(e, 'menu')} />
                        <label htmlFor="menu-img-upload" className="menu-upload-label">{imagePreview ? <img src={imagePreview} alt="Preview" className="menu-thumb-preview" /> : <><FaCloudUploadAlt /> Upload</>}</label>
                        {image && <span className="upload-success-text">Linked!</span>}
                    </div>
                </div>
            </div>
            <div className="form-group"><label>Description</label><textarea placeholder="Description..." className="admin-input" rows="2" value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></div>
            <div className="variations-section"><label>Variations</label>{variants.map((variant, index) => (<div key={index} className="variation-row"><input type="text" placeholder="Size" className="admin-input" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} /><input type="number" placeholder="Price" className="admin-input" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} />{variants.length > 1 && <button className="remove-btn-small" onClick={() => removeVariant(index)}>❌</button>}</div>))}<button className="add-variant-btn" onClick={addVariant}>+ Add Size</button></div>
            <div className="form-actions">{isEditing && <button className="cancel-btn-admin" onClick={resetForm}>Cancel</button>}<button className={`admin-btn-save ${isEditing ? 'update-mode' : ''}`} onClick={handleSave}>{isEditing ? 'Update Item' : 'Save Item'}</button></div>
        </div>
        <div className="menu-list-container">
            <h3><FaClipboardList /> Existing Items</h3>
            <div className="menu-items-scroll">
                {menuList.map(item => (
                    <div key={item.id} className="menu-list-item">
                        <div className="item-info"><h4>{item.name}</h4><span>{item.category}</span></div>
                        <div className="item-actions">
                            <button className="edit-icon-btn" onClick={() => handleEdit(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPencil /></button>
                            <button className="delete-icon-btn" onClick={() => handleDeleteClick(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-logo">🍕 Admin Panel</h2>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><IoBarChartSharp /> Dashboard</li>
          <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}><FaBoxOpen /> Orders</li>
          <li className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}><MdOutlineMenuBook /> Menu Manager</li>
          <li className="logout" onClick={() => window.location.href = '/'}><IoLogOut /> Logout</li>
        </ul>
      </div>
      <div className="main-area">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'menu' && renderMenu()}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
            <div className="delete-modal"><div className="delete-icon-circle">⚠️</div><h3>Are you sure?</h3><p>Do you really want to delete this item?</p><div className="delete-actions"><button className="cancel-btn-modal" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="confirm-delete-btn" onClick={confirmDelete}>Delete</button></div></div>
        </div>
      )}
      {showReceivedModal && (
        <div className="modal-overlay">
            <div className="delete-modal"><div className="received-icon-circle"></div><h3>Order Received?</h3><p>Did the customer receive this order? This will move the order to <b>History</b>.</p><div className="delete-actions"><button className="cancel-btn-modal" onClick={cancelReceived}>No</button><button className="confirm-received-btn" onClick={confirmReceived}>Yes</button></div></div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;