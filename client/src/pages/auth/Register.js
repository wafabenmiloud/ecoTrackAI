import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiArrowLeft } from 'react-icons/fi';
import '../../styles/Auth.css';


const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setRegistrationError("");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, error } = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        navigate("/dashboard");
      } else {
        setRegistrationError(error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setRegistrationError("An error occurred. Please try again later.");
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        {(authError || registrationError) && (
          <div className="error-box">
            <div className="error-content">
              <FiAlertCircle className="error-icon" />
              <p>{authError || registrationError}</p>
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
              <FiUser style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
            </div>
            {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ fontSize: '0.75rem', color: '#4B5563' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              {showPassword ? (
                <FiEyeOff
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FiEye
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              {showConfirmPassword ? (
                <FiEyeOff
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <FiEye
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
            {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit" 
            className="btn btn-primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
