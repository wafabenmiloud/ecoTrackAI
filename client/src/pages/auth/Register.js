import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/form/Input";
import Button from "../../components/form/Button";
import "./Register.css";
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
   <div className="register-page">
  <div className="register-card">

    <div>
      <h2 className="register-title">Create your account</h2>
      <p className="register-subtitle">
        Or <Link to="/login">sign in</Link>
      </p>
    </div>

    {(authError || registrationError) && (
      <div className="error-box">
        <div className="error-content">
          <svg
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p>{authError || registrationError}</p>
        </div>
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <Input
        label="Full name"
        id="name"
        name="name"
        type="text"
        required
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="John Doe"
      />

      <Input
        label="Email address"
        id="email"
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        id="password"
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="••••••••"
      />

      <Input
        label="Confirm password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        required
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="••••••••"
      />

      <Button
        className="register-btn"
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Create account
      </Button>
    </form>

  </div>
</div>

  );
};

export default Register;
