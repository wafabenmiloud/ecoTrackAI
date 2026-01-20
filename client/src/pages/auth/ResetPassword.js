import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import '../../styles/Auth.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isTokenValid, setIsTokenValid] = useState(true);
  
  const { resetToken } = useParams();
  const { resetPassword, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token is valid
    if (!resetToken) {
      setIsTokenValid(false);
    }
  }, [resetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { success, error } = await resetPassword(resetToken, formData.password);
      
      if (success) {
        setMessage({ 
          type: 'success', 
          text: 'Password has been reset successfully. You will be redirected to login in 5 seconds...' 
        });
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: {
                type: 'success',
                text: 'Your password has been reset. Please login with your new password.'
              }
            } 
          });
        }, 5000);
      } else {
        setMessage({ 
          type: 'danger', 
          text: error || 'Failed to reset password. Please try again.' 
        });
      }
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: 'An error occurred. Please try again later.' 
      });
      console.error('Reset password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Invalid or Expired Link</h1>
            <p className="auth-subtitle">
              The password reset link is invalid or has expired.
            </p>
          </div>

          <div className="auth-form">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => navigate('/forgot-password')}
            >
              Request a new reset link
            </button>

            <div className="form-footer">
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FiArrowLeft style={{ marginRight: '0.5rem' }} />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">
            Create a new password for your account.
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
            <label className="form-label" htmlFor="password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <FiLock style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
            </div>
            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
              Must be at least 6 characters long.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <FiLock style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
            </div>
            {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Resetting password...
              </>
            ) : 'Reset Password'}
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

export default ResetPassword;