import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import '../../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing errors when the component mounts
    setLoginError('');
  }, []);

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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { success, error } = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setLoginError(error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">
            Don't have an account?{' '}
            <Link to="/register">Create one now</Link>
          </p>
        </div>

        {(authError || loginError) && (
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            {authError || loginError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: '#3B82F6', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
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
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>

          <div className="form-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
