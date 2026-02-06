import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

import { IoBarChartSharp, IoStatsChart, IoLogOut, IoFlashSharp, IoTime } from "react-icons/io5"; 
import { FaBoxOpen, FaPizzaSlice, FaScroll, FaPlusSquare, FaClipboardList, FaCloudUploadAlt, FaCalendarAlt, FaImages, FaBars, FaTimes, FaFileDownload, FaEdit, FaTrashAlt, FaPlusCircle, FaComments, FaStar } from "react-icons/fa";
import { MdOutlineMenuBook, MdWavingHand, MdStorefront } from "react-icons/md";
import { FaPencil, FaTrash } from "react-icons/fa6";

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Pizza');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(''); 
  const [variants, setVariants] = useState([{ name: '', price: '' }]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const [discountType, setDiscountType] = useState('percentage'); 
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [deleteType, setDeleteType] = useState('');

  const [orderSearch, setOrderSearch] = useState('');
  
  const [salesView, setSalesView] = useState('Weekly');
  const [productView, setProductView] = useState('Weekly');

  const [promoId, setPromoId] = useState(null); 
  const [promoImage, setPromoImage] = useState('');
  const [promoHeading, setPromoHeading] = useState('');
  const [promoSub, setPromoSub] = useState('');
  const [promoCode, setPromoCode] = useState('');
  
  const [bannerList, setBannerList] = useState([]); 
  const [showBannerSelector, setShowBannerSelector] = useState(false); 
  const [bannerActionType, setBannerActionType] = useState(''); 

  const [storeSettingsId, setStoreSettingsId] = useState(null);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [isHolidayActive, setIsHolidayActive] = useState(false);

  const [menuList, setMenuList] = useState([]); 
  const [orders, setOrders] = useState([]); 
  const [reviewsList, setReviewsList] = useState([]);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;  

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Image Upload Failed!");
      return null;
    }
  };

  const handleImageFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading("Uploading Image... 📤");

    const url = await uploadToCloudinary(file);
    
    toast.dismiss(loadingToast);

    if (url) {
        if (type === 'MENU') {
            setImage(url);
        } else if (type === 'PROMO') {
            setPromoImage(url);
        }
        toast.success("Image Uploaded! ✅");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin'); 
      } else {
        fetchMenu(); 
        fetchOrders();
        fetchAllBanners();
        fetchStoreSettings();
        fetchAllReviews();
      }
    };
    checkUser();
  }, []);

  useEffect(() => {

    fetchOrders();

    const channel = supabase
      .channel('realtime-orders') 
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          
          if (payload.eventType === 'INSERT') {
            console.log('New Order Received:', payload.new);
            
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log("Audio error:", e));

            setOrders((prevOrders) => [payload.new, ...prevOrders]);
            
            toast.success(`New Order #${payload.new.id} Received!`, { duration: 4000 });
          } 

          else if (payload.eventType === 'UPDATE') {
            console.log('Order Updated:', payload.new);
            
            setOrders((prevOrders) => 
              prevOrders.map((order) => 
                order.id === payload.new.id ? payload.new : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let timeout;

    const doLogout = () => {
      sessionStorage.removeItem('pizzaAdminLogin');
      
      window.location.replace('/admin/');
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(doLogout, 3600000); 
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, []);

  const fetchMenu = async () => {
    let { data, error } = await supabase.from('menu_items').select('*').order('id', { ascending: false });
    if (!error) setMenuList(data);
  };

  const fetchOrders = async () => {
    let { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
    if (!error) setOrders(data);
  };

  const fetchAllReviews = async () => {
    let { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviewsList(data);
  };

  const fetchAllBanners = async () => {
    let { data, error } = await supabase.from('promo_settings').select('*').order('id', { ascending: false });
    if (data) {
        setBannerList(data);
        if(data.length === 1) {
            loadBannerToForm(data[0]);
        }
    }
  };

  const fetchStoreSettings = async () => {
    console.log("🔍 Fetching store settings...");
    
    let { data, error } = await supabase.from('store_settings').select('*');

    if (error) {
        console.error("Error loading settings:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("Creating default settings...");
        const { data: newData, error: insertError } = await supabase
            .from('store_settings')
            .insert([{
                open_time: '08:00:00',
                close_time: '22:00:00',
                is_holiday_active: false
            }])
            .select();
        
        if (newData && newData.length > 0) {
            loadStoreSettings(newData[0]);
        }
    } else {
        loadStoreSettings(data[0]);
    }
  };

  const sendBulkEmail = async (subject, mainMessage) => {
      const { data: subs } = await supabase.from('subscribers').select('email');
      if (!subs || subs.length === 0) return;

      const fullMessage = `${mainMessage}\n\nFor more information, visit https://pizzapalacelk.vercel.app/.`;

      subs.forEach(sub => {
          const templateParams = {
              to_email: sub.email,
              subject: subject,
              message: fullMessage
          };
          
          emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
              templateParams, 
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY  
          )
              .then(() => console.log(`Email sent to ${sub.email}`))
              .catch((err) => console.error("Email failed", err));
      });
      toast.success("Newsletter Sent to Subscribers! 📨");
  };

  const loadStoreSettings = (settings) => {
    console.log("📥 Loading settings to form:", settings);
    
    setStoreSettingsId(settings.id);
    setOpenTime(settings.open_time ? settings.open_time.slice(0, 5) : '08:00');
    setCloseTime(settings.close_time ? settings.close_time.slice(0, 5) : '22:00');
    setIsHolidayActive(settings.is_holiday_active || false);
    
    if (settings.holiday_start) {
        const startDate = new Date(settings.holiday_start);
        setHolidayStart(formatDateTimeLocal(startDate));
    }
    if (settings.holiday_end) {
        const endDate = new Date(settings.holiday_end);
        setHolidayEnd(formatDateTimeLocal(endDate));
    }
  };

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadBannerToForm = (banner) => {
      setPromoId(banner.id);
      setPromoHeading(banner.heading);
      setPromoSub(banner.sub_heading);
      setPromoCode(banner.promo_code);
      setPromoImage(banner.image_url);
  };

  const clearBannerForm = () => {
      setPromoId(null);
      setPromoHeading('');
      setPromoSub('');
      setPromoCode('');
      setPromoImage('');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true });
  };


  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadToast = toast.loading("Uploading Image...");
    setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file); 
        if (type === 'promo') { setPromoImage(fakeUrl); }
        toast.dismiss(uploadToast);
        toast.success("Image Uploaded Successfully!");
    }, 1500);
  };

  const handleUpdateClick = () => {
      if (bannerList.length === 0) {
          toast.error("No banners to update!");
          return;
      }
      if (bannerList.length === 1) {
          loadBannerToForm(bannerList[0]);
          toast("Editing existing banner", { icon: '✏️' });
      } else {
          setBannerActionType('UPDATE');
          setShowBannerSelector(true);
      }
  };

  const handleBannerDeleteClick = () => {
      if (bannerList.length === 0) {
          toast.error("No banners to delete!");
          return;
      }
      if (bannerList.length === 1) {
          setDeleteId(bannerList[0].id); 
          setBannerActionType('DELETE_CONFIRM'); 
          setShowDeleteModal(true); 
      } else {
          setBannerActionType('DELETE');
          setShowBannerSelector(true);
      }
  };

  const handleBannerSelect = (banner) => {
      setShowBannerSelector(false);
      if (bannerActionType === 'UPDATE') {
          loadBannerToForm(banner);
          toast("Selected banner loaded for editing", { icon: '✅' });
      } else if (bannerActionType === 'DELETE') {
          setDeleteId(banner.id);
          setBannerActionType('DELETE_CONFIRM');
          setShowDeleteModal(true); 
      }
  };

  const saveBannerToDB = async () => {
    const bannerData = {
        heading: promoHeading,
        sub_heading: promoSub,
        promo_code: promoCode,
        image_url: promoImage 
    };

    if (promoId) {
        const { error } = await supabase.from('promo_settings').update(bannerData).eq('id', promoId);
        if (!error) { toast.success("Banner Updated!"); fetchAllBanners(); } 
        else toast.error("Update Failed!");
    } else {
        const { error } = await supabase.from('promo_settings').insert([bannerData]);
        if (!error) { toast.success("New Banner Added!"); fetchAllBanners(); clearBannerForm(); }
        else toast.error("Failed to add!");
    }

    if (!error) {
        sendBulkEmail(
                "Special Promotion! 🎉", 
                `A special offer from us! ${promoHeading} - ${promoSub}. Code: ${promoCode}`
            );
        }        
  };

  const saveDailyHours = async () => {
    if (!openTime || !closeTime) {
        toast.error("Please set both opening and closing times!");
        return;
    }
    const formattedOpen = openTime.length === 5 ? openTime + ':00' : openTime;
    const formattedClose = closeTime.length === 5 ? closeTime + ':00' : closeTime;

    const storeData = {
        open_time: formattedOpen,
        close_time: formattedClose
    };

    try {
        let error;
        
        if (storeSettingsId) {
            const { error: updateError } = await supabase
                .from('store_settings')
                .update(storeData)
                .eq('id', storeSettingsId);
            error = updateError;
        } else {
            const { data: newData, error: insertError } = await supabase
                .from('store_settings')
                .insert([{ ...storeData, is_holiday_active: false }])
                .select();
            
            if (newData && newData.length > 0) {
                setStoreSettingsId(newData[0].id);
            }
            error = insertError;
        }

        if (error) {
            console.error("Save Error:", error);
            toast.error("Failed to save hours!");
        } else {
            toast.success("Shop Hours Updated Successfully! ✅");
            fetchStoreSettings(); 
        }

    } catch (err) {
        console.error("Exception:", err);
        toast.error("An error occurred");
    }
  };

  const setHolidayMode = async () => {
    if (!holidayStart || !holidayEnd) {
        toast.error("Please select both start and end date/time!");
        return;
    }

    const startDate = new Date(holidayStart);
    const endDate = new Date(holidayEnd);

    if (endDate <= startDate) {
        toast.error("End time must be after start time!");
        return;
    }

    console.log("🏖️ Activating holiday mode...", { startDate, endDate, storeSettingsId });

    const holidayData = {
        is_holiday_active: true,
        holiday_start: startDate.toISOString(),
        holiday_end: endDate.toISOString()
    };

    console.log("Holiday data:", holidayData);

    try {
        if (storeSettingsId) {
            const { data, error } = await supabase
                .from('store_settings')
                .update(holidayData)
                .eq('id', storeSettingsId)
                .select();
            
            console.log("Holiday update response:", { data, error });
            
            if (error) {
                console.error("❌ Holiday activation error:", error);
                toast.error(`Failed: ${error.message}`);
                return;
            }
            
            setIsHolidayActive(true);
            toast.success("Holiday Mode Activated! 🏖️", { duration: 3000 });
            fetchStoreSettings();
        } else {
            const { data, error } = await supabase
                .from('store_settings')
                .insert([{
                    open_time: '08:00:00',
                    close_time: '22:00:00',
                    ...holidayData
                }])
                .select();
            
            console.log("Holiday insert response:", { data, error });
            
            if (error) {
                console.error("❌ Holiday insert error:", error);
                toast.error(`Failed: ${error.message}`);
                return;
            }
            
            if (data && data.length > 0) {
                setStoreSettingsId(data[0].id);
                setIsHolidayActive(true);
                toast.success("Holiday Mode Activated! 🏖️", { duration: 3000 });
                fetchStoreSettings();
            }
        }
    } catch (err) {
        console.error("❌ Exception:", err);
        toast.error("An error occurred");
    }

    const startStr = new Date(holidayStart).toLocaleDateString();
        const endStr = new Date(holidayEnd).toLocaleDateString();
        sendBulkEmail(
            "Shop Closing Notice 🔒", 
            `Due to an emergency, our establishment will be closed from ${startStr} to ${endStr}. We apologize for the inconvenience.`
        );
        
        fetchStoreSettings();
  };

  const clearHolidayMode = async () => {
    if (!storeSettingsId) {
        toast.error("No settings found!");
        return;
    }

    console.log("🔓 Deactivating holiday mode...");

    try {
        const { data, error } = await supabase
            .from('store_settings')
            .update({
                is_holiday_active: false,
                holiday_start: null,
                holiday_end: null
            })
            .eq('id', storeSettingsId)
            .select();

        console.log("Holiday clear response:", { data, error });

        if (error) {
            console.error("❌ Clear error:", error);
            toast.error(`Failed: ${error.message}`);
            return;
        }

        setIsHolidayActive(false);
        setHolidayStart('');
        setHolidayEnd('');
        toast.success("Holiday Mode Deactivated! Shop is Open ✅");
        fetchStoreSettings();
    } catch (err) {
        console.error("❌ Exception:", err);
        toast.error("An error occurred");
    }
  };

  const confirmDelete = async () => {
      let error = null;
      
      if (deleteType === 'BANNER') {
          ({ error } = await supabase.from('promo_settings').delete().eq('id', deleteId));
          if (!error) { 
              fetchAllBanners(); 
              clearBannerForm(); 
          }
      } 
      else if (deleteType === 'MENU') {
          ({ error } = await supabase.from('menu_items').delete().eq('id', deleteId));
          if (!error) {
              fetchMenu();
          }
      } 
      else if (deleteType === 'REVIEW') {
          ({ error } = await supabase.from('reviews').delete().eq('id', deleteId));
          if (!error) {
              fetchAllReviews();
          }
      }

      if (!error) {
          toast.success("Deleted Successfully!");
      } else {
          toast.error("Delete Failed!");
      }
      
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteType('');
      setBannerActionType('');
  };

  const handleDeleteClick = (id) => { 
      setDeleteId(id); 
      setDeleteType('MENU');
      setBannerActionType('');
      setShowDeleteModal(true); 
  };


  const getFilteredOrders = (viewType) => {
    const now = new Date();
    return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        if (viewType === 'Weekly') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return orderDate >= sevenDaysAgo;
        } else if (viewType === 'Monthly') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
        } else if (viewType === 'Annually') {
            return orderDate.getFullYear() === now.getFullYear();
        }
        return true;
    });
  };

  const getSalesChartData = () => {
    const filtered = getFilteredOrders(salesView);
    let labels = [];
    let dataValues = [];

    if (salesView === 'Weekly') {
        const today = new Date();
        const daysMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const label = d.toLocaleDateString('en-US', { weekday: 'short' }); 
            labels.push(label);
            daysMap[label] = 0; 
        }
        filtered.forEach(o => {
            const dayName = new Date(o.created_at).toLocaleDateString('en-US', { weekday: 'short' });
            if (daysMap[dayName] !== undefined) {
                daysMap[dayName] += (Number(o.total_price) || 0);
            }
        });
        dataValues = labels.map(l => daysMap[l]);

    } else if (salesView === 'Monthly') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const weekData = [0, 0, 0, 0];
        const now = new Date();
        filtered.forEach(o => {
            const orderDate = new Date(o.created_at);
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) weekData[3] += (Number(o.total_price) || 0);
            else if (diffDays <= 14) weekData[2] += (Number(o.total_price) || 0);
            else if (diffDays <= 21) weekData[1] += (Number(o.total_price) || 0);
            else weekData[0] += (Number(o.total_price) || 0);
        });
        dataValues = weekData;

    } else {
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthMap = {};
        labels.forEach(m => monthMap[m] = 0);
        filtered.forEach(o => {
            const monthStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short' });
            if (monthMap[monthStr] !== undefined) {
                monthMap[monthStr] += (Number(o.total_price) || 0);
            }
        });
        dataValues = labels.map(l => monthMap[l]);
    }

    return { 
        labels: labels, 
        datasets: [{ 
            label: `Revenue (LKR)`, 
            data: dataValues, 
            backgroundColor: '#ff9f1c', 
            borderRadius: 5,
            barThickness: salesView === 'Annually' ? 15 : 30,
        }] 
    };
  };

  const getSalesChartOptions = () => {
    let stepSize = 100000; 
    let suggestedMax = 500000; 

    if (salesView === 'Monthly') {
        stepSize = 500000; 
        suggestedMax = 2000000; 
    } else if (salesView === 'Annually') {
        stepSize = 1000000; 
        suggestedMax = 5000000; 
    }

    return {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: suggestedMax, 
                ticks: {
                    stepSize: stepSize, 
                    color: '#555',
                    font: { weight: 'bold', size: 10 }, 
                    callback: function(value) {
                        if (value === 0) return '0';
                        if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
                        return (value / 1000).toFixed(0) + 'k';
                    }
                },
                grid: { color: '#e0e0e0' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#555', font: { size: 11 } }
            }
        }
    };
  };

  const getProductChartData = () => {
    const filtered = getFilteredOrders(productView);
    let itemCounts = {};
    filtered.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const name = item.name.split('(')[0].trim(); 
                itemCounts[name] = (itemCounts[name] || 0) + Number(item.quantity);
            });
        }
    });
    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sortedItems.map(i => i[0]);
    const data = sortedItems.map(i => i[1]);
    return { 
        labels: labels.length > 0 ? labels : ['No Sales'], 
        datasets: [{ 
            data: data.length > 0 ? data : [1], 
            backgroundColor: ['#ff9f1c', '#1a1a1a', '#d32f2f', '#28a745', '#888888'], 
            borderWidth: 1 
        }] 
    };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();
    doc.setFontSize(18);
    doc.text(`Pizza Shop - Sales Report (${salesView})`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    const salesData = getFilteredOrders(salesView);
    const totalRevenue = salesData.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
    
    doc.autoTable({
        startY: 40,
        head: [['Metric', 'Value']],
        body: [
            ['Report Period', salesView],
            ['Total Orders', salesData.length],
            ['Total Revenue', `Rs. ${totalRevenue.toLocaleString()}`],
            ['Active Customers', new Set(salesData.map(o => o.customer_phone)).size]
        ],
        theme: 'grid',
        headStyles: { fillColor: [255, 159, 28] } 
    });

    let itemCounts = {};
    salesData.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + Number(item.quantity);
            });
        }
    });
    const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);

    doc.text("Items Sold Summary", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Item Name', 'Quantity Sold']],
        body: topItems,
        theme: 'striped'
    });
    doc.save(`Report_${salesView}.pdf`);
    toast.success("Report Downloaded!");
  };

  const resetForm = () => { setItemName(''); setCategory('Pizza'); setDesc(''); setImage(''); setVariants([{ name: '', price: '' }]); setIsEditing(false); setCurrentId(null); };
  const handleVariantChange = (index, field, value) => { const newVariants = [...variants]; newVariants[index][field] = value; setVariants(newVariants); };
  const addVariant = () => setVariants([...variants, { name: '', price: '' }]);
  const removeVariant = (index) => { const newVariants = variants.filter((_, i) => i !== index); setVariants(newVariants); };

  const handleSave = async () => {
    if (!itemName) return toast.error("Item Name is required!");
    if (!image) return toast.error("Please enter Image URL!");
    const newItemData = { name: itemName, category, description: desc, image_url: image, variants };

    if (isEditing) {
        const { error } = await supabase.from('menu_items').update(newItemData).eq('id', currentId);
        if(!error) { toast.success("Item Updated!"); fetchMenu(); resetForm(); }
        else { toast.error("Update Failed!"); }
    } else {
        const { error } = await supabase.from('menu_items').insert([newItemData]);
        if(!error) { toast.success("New Item Added!"); fetchMenu(); resetForm(); }
        else { toast.error("Insert Failed!"); }
    }

    if (!isEditing) {
            sendBulkEmail(
                "New Menu Item Alert!", 
                `We've added a delicious new ${itemName} to the menu! Come and try it.`
            );
    }
  };

  const handleEdit = (item) => { 
      setIsEditing(true); setCurrentId(item.id); setItemName(item.name); setCategory(item.category); 
      setImage(item.image_url || item.image || ''); setDesc(item.description || item.desc || ''); 
      setVariants(item.variants || []); toast("Editing Mode On", { icon: '✏️' }); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'Completed') {
        setOrderToComplete(order);
        setShowCompleteModal(true);
    } else {
        saveOrderStatus(order.id, newStatus);
    }
  };

  const confirmCompleteOrder = async () => {
    if (!orderToComplete) return;
    
    await saveOrderStatus(orderToComplete.id, 'Completed');
    setShowCompleteModal(false);
    setOrderToComplete(null);
  };

  const saveOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) toast.success(`Order #${id} Updated!`);
    else toast.error("Update Failed!");
  };

  // Past Orders Delete Function
  const handleDeleteOrderHistory = async (id) => {
    if(!window.confirm("Are you sure you want to permanently delete this order record?")) return;

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if(error) {
        toast.error("Failed to delete order");
        console.error("Delete Error", error);
    } else {
        toast.success("Order deleted successfully");
        // Manually update local state to remove item immediately
        setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
    }
  };

  const handleLogout = () => { sessionStorage.removeItem('pizzaAdminLogin'); navigate('/'); };

  const activeOrders = orders.filter(o => o.status !== 'Completed');
  const pastOrders = orders.filter(o => o.status === 'Completed');
  const filteredPastOrders = pastOrders.filter(order => {
      const search = orderSearch.toLowerCase();
      const name = order.customer_name || "";
      const phone = order.customer_phone || "";
      return (name.toLowerCase().includes(search) || phone.includes(search) || order.id.toString().includes(search));
  });


  const renderDashboard = () => {
    const totalOrdersCount = orders.length;
    const totalEarnings = orders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const uniqueCustomersCount = new Set(orders.map(o => o.customer_phone)).size;

    return (
        <div className="admin-content fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h2><MdWavingHand /> Welcome Back, Admin!</h2>
            </div>
            
            <div className="stats-grid">
                <div className="admin-card"><h3>Total Orders</h3><p>{totalOrdersCount}</p></div>
                <div className="admin-card"><h3>Total Earnings</h3><p>Rs. {totalEarnings.toLocaleString()}</p></div>
                <div className="admin-card"><h3>Pending Orders</h3><p className="highlight">{pendingCount}</p></div>
                <div className="admin-card"><h3>Total Customers</h3><p>{uniqueCustomersCount}</p></div>
            </div>

            <div className="charts-container">
                <div className="chart-card bar-chart" style={{height: '430px'}}>
                    <div className="chart-header">
                        <div className="chart-title-group"><IoStatsChart className="chart-icon" /><h3>Sales Analytics</h3></div>
                        <select className="chart-filter" value={salesView} onChange={(e) => setSalesView(e.target.value)}>
                            <option value="Weekly">Last 7 Days</option>
                            <option value="Monthly">Last 30 Days</option>
                            <option value="Annually">This Year</option>
                        </select>
                    </div>
                    <div style={{height: '280px', width: '100%'}}>
                        <Bar data={getSalesChartData()} options={getSalesChartOptions()} />
                    </div>
                </div>

                <div className="chart-card pie-chart" style={{height: '430px'}}>
                    <div className="chart-header">
                        <div className="chart-title-group"><FaPizzaSlice className="chart-icon" /><h3>Top Selling Items</h3></div>
                        <select className="chart-filter" value={productView} onChange={(e) => setProductView(e.target.value)}>
                            <option value="Weekly">This Week</option>
                            <option value="Monthly">This Month</option>
                            <option value="Annually">This Year</option>
                        </select>
                    </div>
                    <div className="pie-wrapper" style={{height: '250px', display:'flex', justifyContent:'center'}}>
                        <Pie data={getProductChartData()} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '40px', marginBottom: '40px'}}>
                <button className="admin-btn-save" onClick={generatePDF} style={{backgroundColor:'#333', display:'flex', alignItems:'center', gap:'8px', padding: '12px 24px', fontSize: '1rem'}}>
                    <FaFileDownload /> Download Report
                </button>
            </div>

            <div className="settings-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px',
                maxWidth: '100%',
                overflow: 'hidden' 
            }}>
                
                <div className="settings-card promo-section" style={{ gridColumn: '1 / -1' }}>
                    <div className="section-header"><FaImages className="section-icon" /><h3>Promo Manager</h3></div>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        
                        <div className="upload-box" style={{flexDirection: 'column', gap:'10px', width: '100%'}}>
                            <input type="file" id="promo-upload" hidden onChange={(e) => handleImageFileChange(e, 'PROMO')} />
                            <label htmlFor="promo-upload" className="upload-label" style={{width:'100%', height:'200px', overflow:'hidden', cursor:'pointer', boxSizing:'border-box'}}>
                                {promoImage ? (
                                    <img src={promoImage} alt="Promo" className="promo-preview-img" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                ) : (
                                    <div className="placeholder-content">
                                        <FaCloudUploadAlt className="upload-icon-large" />
                                        <span>Click to Upload Banner</span>
                                    </div>
                                )}
                            </label>
                            <input className="admin-input" placeholder="Image Link" value={promoImage} onChange={(e)=>setPromoImage(e.target.value)} style={{fontSize:'12px', width: '100%', boxSizing: 'border-box'}} />
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'15px'}}>
                            <div className="form-group">
                                <label>Banner Heading</label>
                                <input className="admin-input" placeholder="Ex: HOT & SPICY" value={promoHeading} onChange={(e)=>setPromoHeading(e.target.value)} style={{width:'100%', boxSizing:'border-box'}} />
                            </div>
                            <div className="form-group">
                                <label>Sub Heading</label>
                                <input className="admin-input" placeholder="Ex: Pizza of the Month" value={promoSub} onChange={(e)=>setPromoSub(e.target.value)} style={{width:'100%', boxSizing:'border-box'}} />
                            </div>
                        </div>

                        <button 
                            className="admin-btn" 
                            style={{
                                background:'#34495e', display:'flex', alignItems:'center', justifyContent:'center', 
                                gap:'10px', padding:'15px', fontSize:'1rem', marginTop:'10px'
                            }}
                            onClick={() => setShowPromoModal(true)}
                        >
                            <FaPlusSquare /> 
                            {promoCode ? `Promo Active: ${promoCode} (Edit)` : "Configure Promo Rules"} 
                        </button>

                        <div className="form-actions" style={{marginTop:'10px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
                            <button className="admin-btn-save" onClick={saveBannerToDB} style={{flex:1, minWidth:'150px'}}>
                                {promoId ? "Update Banner" : "Save Banner"}
                            </button>
                            {promoId && (
                                <button className="admin-btn-save" onClick={() => { clearBannerForm(); toast("Cleared"); }} style={{background: '#28a745', width:'100px'}}>
                                    New
                                </button>
                            )}
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'10px', flexWrap:'wrap'}}>
                            <button className="admin-promo-btn btn-edit-blue" onClick={handleUpdateClick} style={{flex:1}}><FaEdit /> Edit</button>
                            <button className="admin-promo-btn btn-delete-red" onClick={handleBannerDeleteClick} style={{flex:1}}><FaTrashAlt /> Delete</button>
                        </div>
                    </div>
                </div>

                {showPromoModal && (
                    <div className="modal-overlay" style={{
                        position:'fixed', top:0, left:0, width:'100%', height:'100%', 
                        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)', 
                        display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000
                    }}>
                        <div className="modal-content fade-in" style={{
                            background:'white', padding:'25px', borderRadius:'10px', 
                            width:'90%', maxWidth:'450px', position:'relative', boxShadow:'0 10px 30px rgba(0,0,0,0.3)'
                        }}>
                            <button onClick={() => setShowPromoModal(false)} style={{position:'absolute', top:'10px', right:'15px', background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#555'}}>✖</button>
                            
                            <h3 style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', color:'#333'}}>
                                <FaPlusSquare /> Promo Rules
                            </h3>

                            <div className="form-group" style={{marginBottom:'15px'}}>
                                <label style={{fontWeight:'bold', color:'#d35400', display:'block', marginBottom:'5px'}}>Promo Code</label>
                                <input className="admin-input" placeholder="Ex: SAVE20" value={promoCode} onChange={(e)=>setPromoCode(e.target.value)} style={{width:'100%', boxSizing:'border-box', border:'2px solid #ff9f1c'}} />
                            </div>

                            <div style={{display:'flex', gap:'15px', marginBottom:'15px'}}>
                                <div style={{flex:1}}>
                                    <label style={{fontSize:'0.85rem', marginBottom:'5px', display:'block', color:'#333'}}>Type</label>
                                    <select className="admin-input" value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{width:'100%', boxSizing:'border-box'}}>
                                        <option value="percentage">%</option>
                                        <option value="fixed">Rs.</option>
                                    </select>
                                </div>
                                <div style={{flex:1}}>
                                    <label style={{fontSize:'0.85rem', marginBottom:'5px', display:'block', color:'#333'}}>Value</label>
                                    <input type="number" className="admin-input" placeholder="10" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} style={{width:'100%', boxSizing:'border-box'}} />
                                </div>
                            </div>

                            <div style={{display:'flex', gap:'15px', marginBottom:'20px'}}>
                                <div style={{flex:1}}>
                                    <label style={{fontSize:'0.85rem', marginBottom:'5px', display:'block', color:'#333'}}>Start Date</label>
                                    <input type="date" className="admin-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{width:'100%', boxSizing:'border-box'}} />
                                </div>
                                <div style={{flex:1}}>
                                    <label style={{fontSize:'0.85rem', marginBottom:'5px', display:'block', color:'#333'}}>End Date</label>
                                    <input type="date" className="admin-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{width:'100%', boxSizing:'border-box'}} />
                                </div>
                            </div>

                            <button 
                                className="admin-btn" 
                                style={{width:'100%', background:'#e67e22', padding:'12px'}}
                                onClick={handleSavePromo} 
                                disabled={isPromoLoading}
                            >
                                {isPromoLoading ? 'Saving...' : 'Set Rules & Save'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="settings-card store-section" style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div className="section-header"><MdStorefront className="section-icon" /><h3>Store Hours</h3></div>
                    
                    <div className="time-inputs" style={{display:'flex', gap:'10px', marginBottom:'15px', flexWrap: 'wrap'}}>
                        <div style={{flex: '1 1 120px'}}>
                            <label style={{fontSize:'0.85rem', color:'#666', marginBottom:'5px', display:'block'}}>Opening</label>
                            <input type="time" className="admin-input" value={openTime} onChange={(e) => setOpenTime(e.target.value)} style={{width: '100%', boxSizing: 'border-box'}} />
                        </div>
                        <div style={{flex: '1 1 120px'}}>
                            <label style={{fontSize:'0.85rem', color:'#666', marginBottom:'5px', display:'block'}}>Closing</label>
                            <input type="time" className="admin-input" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} style={{width: '100%', boxSizing: 'border-box'}} />
                        </div>
                    </div>
                    
                    <button className="save-status-btn" onClick={saveDailyHours} style={{width:'100%', padding:'10px', background:'#28a745', color:'#fff', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>
                        Save Hours
                    </button>
                    
                    <hr className="divider" style={{margin:'25px 0', border:'none', borderTop:'1px solid #ddd'}} />
                    
                    <h4 style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'15px'}}><FaCalendarAlt /> Holiday Mode</h4>
                    
                    {isHolidayActive && (
                        <div style={{background:'#fff3cd', border:'1px solid #ffc107', padding:'10px', borderRadius:'5px', marginBottom:'15px', fontSize:'0.9rem'}}>
                            ⚠️ <strong className='text-black'>Shop Closed</strong>
                        </div>
                    )}
                    
                    <div style={{marginBottom:'10px'}}>
                        <label style={{fontSize:'0.85rem', color:'#666', marginBottom:'5px', display:'block'}}>Start</label>
                        <input type="datetime-local" className="admin-input" value={holidayStart} onChange={(e) => setHolidayStart(e.target.value)} style={{width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{marginBottom:'15px'}}>
                        <label style={{fontSize:'0.85rem', color:'#666', marginBottom:'5px', display:'block'}}>End</label>
                        <input type="datetime-local" className="admin-input" value={holidayEnd} onChange={(e) => setHolidayEnd(e.target.value)} style={{width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    
                    {isHolidayActive ? 
                        <button className="btn-holiday-off" onClick={clearHolidayMode} style={{width: '100%'}}>Reopen Shop</button> :
                        <button className="admin-btn-save" style={{background: '#d32f2f', width:'100%', padding:'10px'}} onClick={setHolidayMode}>Close Shop</button>
                    }
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
        <table className="admin-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
            <tr>
                <th style={{textAlign: 'left', padding: '12px'}}>ID</th>
                <th style={{textAlign: 'left', padding: '12px', width: '180px'}}>Date & Time</th>
                <th style={{textAlign: 'left', padding: '12px', width: '250px'}}>Customer</th>
                <th style={{textAlign: 'left', padding: '12px'}}>Items & Total</th>
                <th style={{textAlign: 'left', padding: '12px', width: '150px'}}>Status</th>
            </tr>
            </thead>
            <tbody>
            {activeOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                
                <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'left', fontWeight: 'bold' }}>#{order.id}</td>

                <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'left' }}>
                    <div style={{fontWeight: '500'}}>{new Date(order.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                </td>

                <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '15px' }}>{order.customer_name}</div>
                    <div style={{ color: '#333', fontSize: '13px', marginBottom: '2px' }}>{order.address}</div>
                    <div style={{ color: 'blue', fontSize: '13px' }}>{order.phone}</div>
                </td>

                <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'left' }}>
                    <div style={{fontWeight: 'bold', color: '#e67e22', marginBottom: '5px'}}>Rs. {order.total_price}</div>
                    <div style={{ fontSize: '13px', color: '#444' }}>
                    {order.items && order.items.map((i, idx) => (
                        <div key={idx} style={{marginBottom: '2px'}}>• {i.name} x {i.quantity}</div>
                    ))}
                    </div>
                </td>

                <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'left' }}>
                    <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#000', width: '100%', fontSize: '14px' }}
                    >
                    <option value="Pending">Pending</option>
                    <option value="Cooking">Cooking</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    </select>
                </td>

                </tr>
            ))}
            </tbody>
        </table>
      </div>
      
      <div className="list-header" style={{marginTop: '40px', borderBottom: 'none'}}>
          <h3 className="section-title"><FaScroll /> Past Orders</h3>
          <input type="text" placeholder="Search History..." className="search-input" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
      </div>
      <div className="table-container">
        <table className="admin-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
                <tr>
                    <th style={{textAlign: 'left', padding: '12px'}}>ID</th>
                    <th style={{textAlign: 'left', padding: '12px'}}>Date</th>
                    <th style={{textAlign: 'left', padding: '12px'}}>Customer</th>
                    <th style={{textAlign: 'left', padding: '12px'}}>Total</th>
                    <th style={{textAlign: 'left', padding: '12px'}}>Status</th>
                    <th style={{textAlign: 'left', padding: '12px'}}>Action</th>
                </tr>
            </thead>
            <tbody>
            {filteredPastOrders.map(order => (
                <tr key={order.id} className="past-order-row" style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '12px'}}><strong>#{order.id}</strong></td>
                <td style={{padding: '12px'}}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={{padding: '12px'}}>{order.customer_name} <br/><span style={{fontSize:'12px', color:'#777'}}>{order.customer_phone}</span></td>
                <td style={{padding: '12px'}}>Rs. {order.total_price}</td>
                <td style={{padding: '12px'}}><span className="status-badge completed" style={{padding:'4px 8px', borderRadius:'4px', background:'#e8f5e9', color:'#2e7d32', fontSize:'12px'}}>Completed</span></td>
                <td style={{padding: '12px'}}>
                    <button 
                        onClick={() => handleDeleteOrderHistory(order.id)} 
                        style={{background:'none', border:'none', cursor:'pointer', color:'#d32f2f', fontSize:'16px'}}
                        title="Delete permanently"
                    >
                        <FaTrash />
                    </button>
                </td>
                </tr>
            ))}
            {filteredPastOrders.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'20px', color:'#888'}}>No past orders found.</td></tr>}
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
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isEditing ? <><FaPencil /> Update Item</> : <><FaPlusSquare /> Add New Item</>}
            </h3>
            <div className="form-group"><label>Item Name</label><input type="text" placeholder="Item Name" className="admin-input" value={itemName} onChange={(e) => setItemName(e.target.value)} /></div>
            <div className="form-row">
                <div className="form-group"><label>Category</label><select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="Pizza">Pizza</option><option value="Side Items">Side Items</option><option value="Beverages">Beverages</option><option value="Desserts">Desserts</option><option value="Combo Ideas">Combo Ideas</option></select></div>
            </div>
            <div className="form-group">
                <label>Image URL</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, 'MENU')}
                    style={{marginBottom:'10px', padding:'0px'}} 
                />
                <input type="text" placeholder="https://..." className="admin-input" value={image} onChange={(e) => setImage(e.target.value)} />
                {image && <img src={image} alt="Preview" style={{width:'50px', height:'50px', borderRadius:'5px', marginTop:'5px', objectFit:'cover', border:'1px solid #666'}} />}
            </div>
            <div className="form-group"><label>Description</label><textarea placeholder="Description..." className="admin-input" rows="2" value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></div>
            <div className="variations-section">
                <label style={{ fontWeight: '600', color: '#555' }}>Variations</label>
                {variants.map((variant, index) => (
                    <div key={index} className="variation-row">
                        <input type="text" placeholder="Size" className="admin-input" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} />
                        <input type="number" placeholder="Price" className="admin-input" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} />
                        {variants.length > 1 && <button className="remove-btn-small" onClick={() => removeVariant(index)}>❌</button>}
                    </div>
                ))}
                <button className="add-variant-btn" onClick={addVariant}>+ Add Size</button>
            </div>
            <div className="form-actions">{isEditing && <button className="cancel-btn-admin" onClick={resetForm}>Cancel</button>}<button className={`admin-btn-save ${isEditing ? 'update-mode' : ''}`} onClick={handleSave}>{isEditing ? 'Update' : 'Save'}</button></div>
        </div>
        <div className="menu-list-container">
            <h3><FaClipboardList /> Existing Items</h3>
            <div className="menu-items-scroll">
                {menuList.length === 0 && <p style={{color:'#666', textAlign:'center', marginTop:'20px'}}>No items.</p>}
                {menuList.map(item => (
                    <div key={item.id} className="menu-list-item">
                        <div className="item-info">
                            <img src={item.image_url || item.image} alt="" style={{width:'40px', height:'40px', borderRadius:'5px', marginRight:'10px', objectFit:'cover'}} />
                            <div><h4>{item.name}</h4><span>{item.category}</span></div>
                        </div>
                        <div className="item-actions">
                            <button className="edit-icon-btn" onClick={() => handleEdit(item)}><FaPencil /></button>
                            <button className="delete-icon-btn" onClick={() => handleDeleteClick(item.id)}><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );

    const renderReviews = () => (
    <div className="admin-content fade-in">
        <h2><FaComments /> Manage Reviews</h2>
        <div className="table-container">
            <table className="admin-table">
                <thead><tr><th>Date</th><th>Name</th><th>Rating</th><th>Message</th><th>Action</th></tr></thead>
                <tbody>
                    {reviewsList.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No reviews yet.</td></tr>}
                    {reviewsList.map(rev => (
                        <tr key={rev.id}>
                            <td>{new Date(rev.created_at).toLocaleDateString()}</td>
                            <td>{rev.name}<br/><small style={{color:'#777'}}>{rev.email}</small></td>
                            <td>
                                <div style={{display:'flex'}}>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} size={12} color={i < rev.rating ? "#ffc107" : "#e4e5e9"} />
                                    ))}
                                </div>
                            </td>
                            <td style={{maxWidth:'300px'}}>{rev.message}</td>
                            <td>
                                <button className="delete-icon-btn" onClick={() => { setDeleteId(rev.id); setDeleteType('REVIEW'); setShowDeleteModal(true); }}>
                                    <FaTrashAlt />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const handleSavePromo = async () => {
    if (!promoCode || !discountValue || !startDate || !endDate) {
        toast.error("Please fill all promo details!");
        return;
    }

    setIsPromoLoading(true);

    const { error } = await supabase
        .from('promo_codes')
        .insert([{
            code: promoCode.toUpperCase(), 
            discount_type: discountType,
            value: parseFloat(discountValue),
            start_date: startDate,
            end_date: endDate
        }]);

    if (error) {
        console.error(error);
        toast.error("Failed to add Promo Code!");
    } else {
        toast.success("Promo Rules Saved!");
        setShowPromoModal(false);
    }
    setIsPromoLoading(false);
  };


  return (
    <div className="dashboard-container">
      <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <FaTimes /> : <FaBars />}</button>
      {isSidebarOpen && <div className="admin-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
        <h2 className="sidebar-logo">🍕 Admin Panel</h2>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}><IoBarChartSharp /> Dashboard</li>
          <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}><FaBoxOpen /> Orders</li>
          <li className={activeTab === 'menu' ? 'active' : ''} onClick={() => { setActiveTab('menu'); setIsSidebarOpen(false); }}><MdOutlineMenuBook /> Menu Manager</li>
          <li className={activeTab==='reviews'?'active':''} onClick={()=>{setActiveTab('reviews');setIsSidebarOpen(false)}}><FaComments /> Reviews</li>
          <li className="logout" onClick={handleLogout}><IoLogOut /> Logout</li>
        </ul>
      </div>
      <div className="main-area">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'menu' && renderMenu()}
        {activeTab === 'reviews' && renderReviews()}
      </div>
      
      {showDeleteModal && (
        <div className="modal-overlay">
            <div className="delete-modal"><div className="delete-icon-circle">⚠️</div><h3>Confirm Delete?</h3><p>Are you sure you want to delete this?</p><div className="delete-actions"><button className="cancel-btn-modal" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="confirm-delete-btn" onClick={confirmDelete}>Delete</button></div></div>
        </div>
      )}

      {showCompleteModal && (
        <div className="modal-overlay">
            <div className="delete-modal">
                <div className="delete-icon-circle">✅</div>
                <h3>Mark as Completed?</h3>
                <p>Order #{orderToComplete?.id} will be moved to Past Orders.</p>
                <div className="delete-actions">
                    <button className="cancel-btn-modal" onClick={() => { setShowCompleteModal(false); setOrderToComplete(null); }}>Cancel</button>
                    <button className="confirm-delete-btn" style={{background: '#28a745'}} onClick={confirmCompleteOrder}>Confirm</button>
                </div>
            </div>
        </div>
      )}

      {showBannerSelector && (
          <div className="modal-overlay">
              <div className="modal-content" style={{maxWidth:'500px'}}>
                  <h3>Select Banner to {bannerActionType === 'UPDATE' ? 'Edit' : 'Delete'}</h3>
                  <div style={{maxHeight:'300px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px'}}>
                      {bannerList.map(b => (
                          <div key={b.id} onClick={() => handleBannerSelect(b)} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', border:'1px solid #eee', borderRadius:'5px', cursor:'pointer', background:'#fff'}}>
                              <img src={b.image_url} style={{width:'50px', height:'30px', objectFit:'cover', borderRadius:'3px'}} alt=""/>
                              <div><strong>{b.heading}</strong><div style={{fontSize:'0.8rem', color:'#666'}}>{b.sub_heading}</div></div>
                          </div>
                      ))}
                  </div>
                  <button className="cancel-btn" style={{marginTop:'20px', width:'100%'}} onClick={() => setShowBannerSelector(false)}>Cancel</button>
              </div>
          </div>
      )}

    </div>
  );
}

export default AdminDashboard;