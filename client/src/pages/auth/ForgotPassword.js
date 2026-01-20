// client/src/pages/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import '../../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { forgotPassword, error: authError } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { success, error } = await forgotPassword(email);
      
      if (success) {
        setMessage({ 
          type: 'success', 
          text: 'If an account exists with this email, you will receive a password reset link.' 
        });
      } else {
        setMessage({ 
          type: 'danger', 
          text: error || 'Failed to send reset link. Please try again.' 
        });
      }
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: 'An error occurred. Please try again later.' 
      });
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">
            Remember your password?{' '}
            <Link to="/login">Sign in to your account</Link>
          </p>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.type === 'success' ? (
              <FiCheck className="success-icon" />
            ) : (
              <FiAlertCircle className="error-icon" />
            )}
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <p style={{ marginBottom: '1rem', fontSize: '0.9375rem', color: '#4B5563' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <label className="form-label" htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <FiMail style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
            </div>
            {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Sending reset link...
              </>
            ) : 'Send reset link'}
          </button>

          <div className="form-footer">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <FiArrowLeft style={{ marginRight: '0.5rem' }} />
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;