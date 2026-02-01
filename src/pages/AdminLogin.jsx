import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { toast } from 'react-hot-toast';
import { FaUnlockAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';

import { supabase } from '../supabaseClient'; 
import emailjs from '@emailjs/browser';

function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [resetStep, setResetStep] = useState(0); 
  const [resetEmail, setResetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*]/.test(newPassword);
  const hasNoSpace = !/\s/.test(newPassword);
  const isStrong = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial && hasNoSpace;
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const getStrengthColor = () => {
    let score = 0;
    if (hasMinLen) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (score <= 2) return 'red';
    if (score <= 4) return 'orange';
    return 'green';
  };

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('pizzaAdminToken');
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Login Error:", error.message);
      toast.error(error.message || "Invalid Email or Password! ❌");
      setLoading(false);
    } else {
      toast.success("Welcome Admin! 👨‍🍳");
      
      sessionStorage.setItem('pizzaAdminToken', data.session.access_token);
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email) { toast.error("Please enter a valid email address!"); return; }

    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !data) {
        toast.error("This email is not registered as Admin!");
        return;
    }

    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    setGeneratedOtp(code);

    const templateParams = {
        to_email: email,
        message: `Your OTP Code is: ${code}`,
        subject: "Password Reset Request"
    };

    const loadingToast = toast.loading("Sending code...");

    emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).then(() => {
        toast.dismiss(loadingToast);
        toast.success(`Code sent to ${email}`);
        setStep(3);
    }).catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("Failed to send email.");
        alert(JSON.stringify(err));
    });
  };

  const handleCodeSubmit = () => {
    if (!otp) { 
        toast.error("Please enter the code!"); 
        return; 
    }
    
    if (otp === generatedOtp) {
        toast.success("Code Verified! ✅");
        
        setStep(4); 
    } else {
        toast.error("Invalid Code! Please try again. ❌");
    }
  };

  const handleSaveNewPassword = async () => {
      if (!newPassword || !confirmPassword) {
          toast.error("Please fill all fields!");
          return;
      }

      if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match!");
          return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { error } = await supabase
          .from('admin_users') 
          .update({ password: hashedPassword })
          .eq('email', email); 

      if (!error) {
          toast.success('Password Reset Successfully!');
          
          setStep(1); 
          
          setGeneratedOtp(null);
          setOtp('');
          setPassword(''); 
          setNewPassword('');
          setConfirmPassword('');
      } else {
          console.error(error);
          toast.error("Database Update Failed!");
      }
  };

  return (
    <div className="admin-container">
      <div className="admin-modal">
        {step === 1 && (
          <div className="fade-in">
            <h2>Admin Login <FaUnlockAlt /></h2>
            <input type="text" placeholder="Username" className="admin-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="admin-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="forgot-link" onClick={() => { setEmail(''); setStep(2); }}>Forgot Password?</p>
            <button className="admin-btn" onClick={handleLoginSubmit}>Login</button>
          </div>
        )}
        
        {step === 2 && (
            <div className="fade-in">
                <h2>Reset Password</h2>
                <p>Enter your email to receive a code.</p>
                <input type="email" placeholder="Your Email" className="admin-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className="admin-btn" onClick={handleEmailSubmit}>Next</button>
                <p className="back-link" onClick={() => setStep(1)}>Back to Login</p>
            </div>
        )}

        {step === 3 && (
            <div className="fade-in">
                <h2>Verification</h2>
                <p>Enter the 8-digit code sent to {email}</p>
                <input type="text" placeholder="12345678" maxLength="8" className="admin-input" style={{letterSpacing: '5px', textAlign: 'center'}} value={otp} onChange={(e) => !isNaN(e.target.value) && setOtp(e.target.value)} />
                <button className="admin-btn" onClick={handleCodeSubmit}>Verify Code</button>
                <p className="back-link" onClick={() => setStep(2)}>Back</p>
            </div>
        )}

        {step === 4 && (
            <div className="fade-in">
                <h2>New Password</h2>
                
                <input 
                    type="password" 
                    placeholder="New Password" 
                    className="admin-input" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    style={{
                        border: `2px solid ${getStrengthColor()}`, 
                        outline: 'none',
                        transition: '0.3s',
                        width: '100%',            
                        boxSizing: 'border-box',   
                        padding: '10px',           
                        letterSpacing: 'normal'  
                    }} 
                />
              
                <input 
                    type="password" 
                    placeholder="Re-enter New Password" 
                    className="admin-input" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    style={{
                        width: '100%',            
                        boxSizing: 'border-box',   
                        padding: '10px',
                        letterSpacing: 'normal',
                        marginTop: '10px'     
                    }}
                />

                <div style={{ 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    marginTop: '5px', 
                    background: '#f3f3f3', 
                    padding: '10px', 
                    borderRadius: '8px'
                }}>
                    <p style={{ color: hasMinLen ? 'green' : '#ff4d4d', margin: '3px 0', transition:'0.3s' }}>
                        {hasMinLen ? '✅' : '⭕'} At least 8 Characters
                    </p>
                    <p style={{ color: hasUpper ? 'green' : '#ff4d4d', margin: '3px 0', transition:'0.3s' }}>
                        {hasUpper ? '✅' : '⭕'} Uppercase Letter (A-Z)
                    </p>
                    <p style={{ color: hasLower ? 'green' : '#ff4d4d', margin: '3px 0', transition:'0.3s' }}>
                        {hasLower ? '✅' : '⭕'} Lowercase Letter (a-z)
                    </p>
                    <p style={{ color: hasNumber ? 'green' : '#ff4d4d', margin: '3px 0', transition:'0.3s' }}>
                        {hasNumber ? '✅' : '⭕'} Number (0-9)
                    </p>
                    <p style={{ color: hasSpecial ? 'green' : '#ff4d4d', margin: '3px 0', transition:'0.3s' }}>
                        {hasSpecial ? '✅' : '⭕'} Symbol (!@#$%)
                    </p>
                    <p style={{ color: passwordsMatch ? 'green' : '#ff4d4d', margin: '3px 0', fontWeight:'bold', transition:'0.3s' }}>
                        {passwordsMatch ? '✅' : '⭕'} Passwords Match
                    </p>
                </div>

                <button 
                    className="admin-btn" 
                    disabled={!isStrong || !passwordsMatch} 
                    style={{
                        opacity: (!isStrong || !passwordsMatch) ? 0.6 : 1,
                        marginTop: '15px',
                        backgroundColor: isStrong && passwordsMatch ? '#2ecc71' : '#333'
                    }} 
                    onClick={handleSaveNewPassword}
                >
                    Save Password
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;