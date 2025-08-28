import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../SignIn.css";

const SignIn = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        "https://blogpost-app-br7f.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Call the onLogin function passed from App.js
        onLogin(data.user, data.token);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };

  return (
    <div className="signin-container">
      <main className="signin-main">
        <div className="signin-card">
          <h2 className="signin-title">Welcome Back</h2>
          <p className="signin-subtitle">Log in to continue to our platform.</p>
          <form className="signin-form" onSubmit={handleSubmit}>
            <label htmlFor="email" className="signin-label">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              className="signin-input"
              placeholder="Email or Username"
              value={credentials.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password" className="signin-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="signin-input"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />

            <div className="signin-options">
              <label className="signin-checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <a href="/forgot" className="signin-forgot">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="signin-loginButton">
              Login
            </button>

            <div className="signin-socialLogin">
              <button className="signin-google">Sign in with Google</button>
              <button className="signin-facebook">Sign in with Facebook</button>
            </div>

            <p className="signin-signup">
              Don't have an account? <Link to="/register">Create account</Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="signin-footer">
        <div className="signin-footerGrid">
          <div>
            <h4>Navigation</h4>
            <ul>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/create">Create Post</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li>
                <a href="/signin">Login</a>
              </li>
              <li>
                <a href="/reset">Forgot Password</a>
              </li>
              <li>
                <a href="/settings">Profile Settings</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms of Service</a>
              </li>
              <li>
                <a href="mailto:support@bloghub.com">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="signin-copyright">© 2025 BlogHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignIn;
