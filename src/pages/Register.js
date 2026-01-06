import { useState } from "react";
import { Link } from "react-router-dom";
import "../Register.css";

const Register = ({ onLogin }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.includes("@")) newErrors.email = "Enter a valid email";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.agreed) newErrors.agreed = "You must agree to the terms";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);

    if (Object.keys(validationErrors).length === 0) {
      const data = {
        username: form.username,
        email: form.email,
        password: form.password,
      };

      console.log("Sending data:", data);

      try {
        const response = await fetch("http://localhost:5555/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const user = await response.json();
          console.log("User created:", user);
          // Auto-login after successful registration
          onLogin(user, user.token); // Adjust based on your API response
        } else {
          const errorData = await response.json();
          console.error("Failed to create user:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">
          Join our community and start sharing your thoughts
        </p>

        <label className="register-label">
          Username
          <input
            type="text"
            name="username"
            className="register-input"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
          />
          {submitted && errors.username && (
            <span className="register-error">{errors.username}</span>
          )}
        </label>

        <label className="register-label">
          Email Address
          <input
            type="email"
            name="email"
            className="register-input"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />
          {submitted && errors.email && (
            <span className="register-error">{errors.email}</span>
          )}
        </label>

        <label className="register-label">
          Password
          <input
            type="password"
            name="password"
            className="register-input"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
          />
          <span className="register-passwordStrength">
            Password strength: {form.password.length < 6 ? "Weak" : "Strong"}
          </span>
          {submitted && errors.password && (
            <span className="register-error">{errors.password}</span>
          )}
        </label>

        <label className="register-label">
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            className="register-input"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {submitted && errors.confirmPassword && (
            <span className="register-error">{errors.confirmPassword}</span>
          )}
        </label>

        <label className="register-checkboxContainer">
          <input
            type="checkbox"
            name="agreed"
            checked={form.agreed}
            onChange={handleChange}
          />
          <span>
            I agree to the <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>
          </span>
        </label>
        {submitted && errors.agreed && (
          <span className="register-error">{errors.agreed}</span>
        )}

        <button type="submit" className="register-createBtn">
          Create Account
        </button>

        <button type="button" className="register-googleBtn">
          <img src="/google-icon.svg" alt="Google" />
          Sign up with Google
        </button>

        <p className="register-loginLink">
          Already have an account?{" "}
          <Link to="/signin" className="home-auth-button secondary">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
