import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Navigation.css";

const Navigation = ({ isAuthenticated, user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search submitted:", searchQuery);
  };

  const handleWritePost = () => {
    if (!isAuthenticated) {
      alert("You must log in to create a post");
      return;
    }
  };

  return (
    <header className="navigation-header">
      <div className="nav-container">
        <Link to="/" className="logo">
          BlogHub
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {isAuthenticated ? (
            <Link to="/create" className="write-button">
              <i className="fas fa-plus"></i> Write Post
            </Link>
          ) : (
            <button className="write-button" onClick={handleWritePost}>
              <i className="fas fa-plus"></i> Write Post
            </button>
          )}
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <div
                className="user-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar-container">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.username}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.username}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
                <i
                  className={`fas fa-chevron-${showUserMenu ? "up" : "down"}`}
                ></i>
              </div>

              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/settings" className="dropdown-item">
                    <i className="fas fa-cog"></i> Settings
                  </Link>
                  <Link to="/my-posts" className="dropdown-item">
                    <i className="fas fa-file-alt"></i> My Posts
                  </Link>
                  <hr className="dropdown-divider" />
                  <button
                    onClick={onLogout}
                    className="dropdown-item logout-item"
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
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
