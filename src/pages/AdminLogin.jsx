import React, { useState } from 'react';
import '../App.css'; 
import { toast } from 'react-hot-toast';
import { FaUnlockAlt } from "react-icons/fa";

function AdminLogin() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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


  const handleEmailSubmit = () => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address!");
      return; 
    }
    toast.success(`Code sent to ${email}`);
    setStep(3);
  };

  const handleCodeSubmit = () => {
    if (!otp || otp.length !== 8) {
      toast.error("Please enter the 8-digit code!");
      return; 
    }
   
    setStep(4);
  };

  return (
    <div className="admin-container">
      <div className="admin-modal">
        
        {step === 1 && (
          <div className="fade-in">
            <h2>Admin Login <FaUnlockAlt /></h2>
            <input 
              type="email" 
              placeholder="Email" 
              className="admin-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <p className="forgot-link" onClick={() => { setEmail(''); setStep(2); }}>Forgot Password?</p>
            
            <button className="admin-btn" onClick={() => {
                if(!email || !password) {
                    toast.error("Enter Email and Password!");
                } else {
                    toast.success('Once the backend is created, you will login here!');
                }
            }}>
              Login
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h2>Reset Password</h2>
            <p>Enter your email to receive a code.</p>
            <input 
              type="email" 
              placeholder="Your Email" 
              className="admin-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <button className="admin-btn" onClick={handleEmailSubmit}>Next</button>
            
            <p className="back-link" onClick={() => setStep(1)}>Back to Login</p>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <h2>Verification</h2>
            <p>Enter the 8-digit code sent to {email}</p>
            <input 
              type="text" 
              placeholder="12345678" 
              maxLength="8" 
              className="admin-input" 
              style={{letterSpacing: '5px', textAlign: 'center'}} 
              value={otp}
              onChange={(e) => {
                  const val = e.target.value;
                  if (!isNaN(val)) setOtp(val);
              }}
            />
            
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
              style={{borderColor: getStrengthColor()}}
            />
            <input 
              type="password" 
              placeholder="Re-enter New Password" 
              className="admin-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <ul className="pass-rules">
              <li style={{color: hasMinLen ? 'green' : '#888'}}>✔ 8+ Characters</li>
              <li style={{color: hasUpper ? 'green' : '#888'}}>✔ Uppercase (A)</li>
              <li style={{color: hasLower ? 'green' : '#888'}}>✔ Lowercase (a)</li>
              <li style={{color: hasNumber ? 'green' : '#888'}}>✔ Number (1-9)</li>
              <li style={{color: hasSpecial ? 'green' : '#888'}}>✔ Special (!@#)</li>
              <li style={{color: hasNoSpace ? 'green' : '#888'}}>✔ No Spaces</li>
            </ul>

            <button 
              className="admin-btn" 
              disabled={!isStrong || !passwordsMatch}
              style={{opacity: (!isStrong || !passwordsMatch) ? 0.5 : 1}}
              onClick={() => { 
                  toast.success('Password Saved Securely!'); 
                  setStep(1); 
                  setEmail('');
                  setPassword('');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
              }}
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