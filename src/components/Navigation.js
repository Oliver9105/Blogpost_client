// components/Navigation.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = ({ isAuthenticated, user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search submitted:", searchQuery);
  };

  const handleWritePost = () => {
    if (!isAuthenticated) {
      alert("You must log in to create a post");
      return;
    }
    // Navigation will be handled by the Link component
  };

  return (
    <header className="view-post-header">
      <div className="view-post-nav-container">
        <Link to="/" className="view-post-logo">
          BlogHub
        </Link>
        <nav className="view-post-nav-links">
          <Link to="/" className="view-post-nav-link">
            Home
          </Link>
          {isAuthenticated ? (
            <Link to="/create" className="view-post-write-button">
              Write Post
            </Link>
          ) : (
            <button
              className="view-post-write-button"
              onClick={handleWritePost}
            >
              Write Post
            </button>
          )}
        </nav>
        <form className="view-post-search-bar" onSubmit={handleSearch}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <span>Welcome, {user?.username}</span>
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/signin" className="auth-button">
                Login
              </Link>
              <Link to="/register" className="auth-button primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
