import React from "react";
import "../SignIn.css";

const SignIn = () => {
  return (
    <div className="signin-container">
      <header className="signin-header">
        <nav className="signin-nav">
          <div className="signin-logo">BlogSpace</div>
          <ul className="signin-navLinks">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
          </ul>
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
              Don’t have an account? <a href="/signup">Create account</a>
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
                <a href="mailto:support@blogspace.com">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="signin-copyright">
          © 2025 BlogSpace. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignIn;
