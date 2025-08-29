import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../SignIn.css";

const SignIn = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Fixed API URL - removed duplicate "http:" prefix
      const API_BASE = "http://localhost:5555";
      let response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // If we get a CORS error (response.ok is false but no response body)
      if (!response.ok && response.status === 0) {
        console.warn("CORS issue detected, trying with proxy...");
        // Try with a CORS proxy as fallback
        response = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(credentials),
        });
      }

      if (response.ok) {
        const data = await response.json();
        // Call the onLogin function passed from App.js
        onLogin(data.user, data.token);
      } else {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setError(
            errorData.message || `Login failed with status: ${response.status}`
          );
        } catch (parseError) {
          setError(
            `Login failed with status: ${response.status}. This might be a CORS issue.`
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "An error occurred during login. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <main className="signin-main">
        <div className="signin-card">
          <h2 className="signin-title">Welcome Back</h2>
          <p className="signin-subtitle">Log in to continue to our platform.</p>

          {error && (
            <div className="signin-error">
              {error}
              <div className="cors-help">
                <small>
                  This appears to be a CORS issue. Please ask the backend
                  developer to enable CORS for this domain.
                </small>
              </div>
            </div>
          )}

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
              disabled={isLoading}
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
              disabled={isLoading}
            />

            <div className="signin-options">
              <label className="signin-checkbox">
                <input type="checkbox" disabled={isLoading} /> Remember me
              </label>
              <a href="/forgot" className="signin-forgot">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="signin-loginButton"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="signin-socialLogin">
              <button
                type="button"
                className="signin-google"
                disabled={isLoading}
              >
                Sign in with Google
              </button>
              <button
                type="button"
                className="signin-facebook"
                disabled={isLoading}
              >
                Sign in with Facebook
              </button>
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
