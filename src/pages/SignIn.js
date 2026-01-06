import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../SignIn.css";

const SignIn = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    identifier: "", // Changed from email to identifier (works for both email/username)
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
      const API_BASE = "https://blogpost-app-qbhg.onrender.com";

      // First attempt
      let response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // If we get a CORS error, try with different headers
      if (!response.ok && response.status === 0) {
        console.warn("CORS issue detected, trying with different headers...");

        // Create a new response variable instead of reassigning
        const retryResponse = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(credentials),
        });

        // Use the retry response instead
        response = retryResponse;
      }

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", responseText);
        setError(
          `Server returned invalid JSON: ${responseText.substring(0, 100)}...`
        );
        return;
      }

      if (response.ok) {
        // Call the onLogin function passed from App.js
        onLogin(data.user, data.token);
      } else {
        setError(data.error || `Login failed with status: ${response.status}`);
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
            <label htmlFor="identifier" className="signin-label">
              Email or Username
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              className="signin-input"
              placeholder="Enter your email or username"
              value={credentials.identifier}
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
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <div className="signin-options">
              <label className="signin-checkbox">
                <input type="checkbox" disabled={isLoading} /> Remember me
              </label>
              <Link to="/forgot-password" className="signin-forgot">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="signin-loginButton"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="signin-spinner"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            <div className="signin-divider">
              <span>or continue with</span>
            </div>

            <div className="signin-socialLogin">
              <button
                type="button"
                className="signin-google"
                disabled={isLoading}
              >
                <span className="signin-socialIcon">G</span>
                Sign in with Google
              </button>
              <button
                type="button"
                className="signin-facebook"
                disabled={isLoading}
              >
                <span className="signin-socialIcon">f</span>
                Sign in with Facebook
              </button>
            </div>

            <p className="signin-signup">
              Don't have an account?{" "}
              <Link to="/register" className="signin-signupLink">
                Create account
              </Link>
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
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/create">Create Post</Link>
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li>
                <Link to="/signin">Login</Link>
              </li>
              <li>
                <Link to="/forgot-password">Forgot Password</Link>
              </li>
              <li>
                <Link to="/settings">Profile Settings</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
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
