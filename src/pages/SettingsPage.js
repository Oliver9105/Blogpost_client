import React, { useState } from "react";
import "../SettingsPage.css";

const SettingsPage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    username: user?.username || "current_user",
    email: user?.email || "user@sample.com",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setProfileData({
        ...profileData,
        avatar: imageUrl,
      });
    }
  };

  const handleRemoveAvatar = () => {
    setProfileData({
      ...profileData,
      avatar: "", // Set to empty string
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated data to your backend
    console.log("Saving settings:", profileData);
    alert("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      console.log("Account deletion requested");
      // Implement account deletion logic here
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <nav className="settings-breadcrumb">
          <span>Home</span> &gt; <span>Account Settings</span>
        </nav>
      </div>

      <div className="settings-wrapper">
        <aside className="settings-sidebar">
          <h3 className="settings-sidebar-title">Settings</h3>
          <ul className="settings-sidebar-list">
            <li
              className={`settings-sidebar-item ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="fas fa-user"></i> Profile Information
            </li>
            <li
              className={`settings-sidebar-item ${
                activeTab === "security" ? "active" : ""
              }`}
              onClick={() => setActiveTab("security")}
            >
              <i className="fas fa-shield-alt"></i> Security
            </li>
            <li
              className={`settings-sidebar-item ${
                activeTab === "preferences" ? "active" : ""
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <i className="fas fa-palette"></i> Preferences
            </li>
            <li
              className={`settings-sidebar-item ${
                activeTab === "account" ? "active" : ""
              }`}
              onClick={() => setActiveTab("account")}
            >
              <i className="fas fa-cog"></i> Account Management
            </li>
          </ul>
        </aside>

        <section className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-tab">
              <h2>Profile Information</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="settings-field-group avatar-upload">
                  <label className="settings-label">Avatar</label>
                  <div className="avatar-preview">
                    <div className="avatar-image">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="avatar-actions">
                      <label
                        htmlFor="avatar-upload"
                        className="avatar-upload-btn"
                      >
                        <i className="fas fa-camera"></i> Change Avatar
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept=".jpg,.png,.gif,.webp"
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                      />
                      {profileData.avatar && (
                        <button
                          type="button"
                          className="avatar-remove-btn"
                          onClick={handleRemoveAvatar}
                        >
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <small className="settings-helper-text">
                    JPG, PNG, or GIF. Max size 2MB.
                  </small>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="settings-input"
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="settings-input"
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="settings-textarea"
                    placeholder="Tell us a little about yourself..."
                  />
                </div>

                <button type="submit" className="settings-save-button">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-tab">
              <h2>Security Settings</h2>
              <div className="settings-field-group">
                <label className="settings-label">Change Password</label>
                <input
                  type="password"
                  placeholder="Current Password"
                  className="settings-input"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="settings-input"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="settings-input"
                />
                <button className="settings-save-button">
                  Update Password
                </button>
              </div>

              <div className="settings-field-group">
                <label className="settings-label">
                  Two-Factor Authentication
                </label>
                <div className="settings-toggle">
                  <span>Enable 2FA</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                </div>
                <small className="settings-helper-text">
                  Add an extra layer of security to your account.
                </small>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="settings-tab">
              <h2>Preferences</h2>
              <div className="settings-field-group">
                <label className="settings-label">Email Notifications</label>
                <div className="settings-toggle">
                  <span>New followers</span>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="settings-toggle">
                  <span>Comments on your posts</span>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="settings-toggle">
                  <span>Mention notifications</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="settings-field-group">
                <label className="settings-label">Theme</label>
                <div className="theme-options">
                  <div className="theme-option">
                    <input
                      type="radio"
                      id="light-theme"
                      name="theme"
                      defaultChecked
                    />
                    <label htmlFor="light-theme">Light</label>
                  </div>
                  <div className="theme-option">
                    <input type="radio" id="dark-theme" name="theme" />
                    <label htmlFor="dark-theme">Dark</label>
                  </div>
                  <div className="theme-option">
                    <input type="radio" id="auto-theme" name="theme" />
                    <label htmlFor="auto-theme">Auto (System)</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="settings-tab">
              <h2>Account Management</h2>
              <div className="settings-field-group">
                <h3 className="danger-zone-title">Danger Zone</h3>
                <div className="danger-zone-content">
                  <p>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                </div>
              </div>

              <div className="settings-field-group">
                <h3>Export Data</h3>
                <p>Download all your data in a ZIP file.</p>
                <button className="export-data-button">
                  <i className="fas fa-download"></i> Export Data
                </button>
              </div>

              <div className="settings-field-group">
                <button className="logout-button" onClick={onLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
