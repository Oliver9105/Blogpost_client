import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../SignIn.css";

const SignIn = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Search submitted:", searchQuery);
  };

  const handleWritePost = () => {
    // Handle write post logic here
    console.log("Write post clicked");
  };

  return (
    <div className="signin-container">
      <header className="signin-header">
        <nav className="signin-nav">
          <div className="signin-logo">BlogHub</div>

          {/* Centered Navigation Links */}
          <div className="signin-nav-center">
            <ul className="signin-navLinks">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
            </ul>
            <button className="signin-write-button" onClick={handleWritePost}>
              Write Post
            </button>
          </div>

          {/* Search Bar */}
          <form className="signin-search-bar" onSubmit={handleSearch}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </nav>
      </header>

      <main className="signin-main">
        <div className="signin-card">
          <h2 className="signin-title">Welcome Back</h2>
          <p className="signin-subtitle">Log in to continue to our platform.</p>
          <form className="signin-form">
            <label htmlFor="email" className="signin-label">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              className="signin-input"
              placeholder="Email or Username"
            />

            <label htmlFor="password" className="signin-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="signin-input"
              placeholder="Password"
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
              Don't have an account? <a href="/signup">Create account</a>
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
                <a href="/login">Login</a>
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
