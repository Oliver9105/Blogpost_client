import React from "react";
import styles from "./SettingsPage.module.css";

const SettingsPage = () => {
  return (
    <div className={styles.settings__container}>
      <nav className={styles.settings__breadcrumb}>
        <span>Home</span> &gt; <span>Account Settings</span>
      </nav>

      <div className={styles.settings__wrapper}>
        <aside className={styles.settings__sidebar}>
          <h3 className={styles.settings__sidebarTitle}>Settings</h3>
          <ul className={styles.settings__sidebarList}>
            <li className={styles.settings__sidebarItem}>Account Profile</li>
            <li className={styles.settings__sidebarItem}>Account Security</li>
            <li className={styles.settings__sidebarItem}>Preferences</li>
            <li
              className={`${styles.settings__sidebarItem} ${styles["settings__sidebarItem--active"]}`}
            >
              Account Management
            </li>
          </ul>
        </aside>

        <section className={styles.settings__profileSection}>
          <h2 className={styles.settings__profileTitle}>Profile Information</h2>
          <form className={styles.settings__form}>
            <div className={styles.settings__avatarUpload}>
              <div className={styles.settings__avatarLabel}>Avatar</div>
              <input type="file" accept=".jpg,.png,.gif" />
              <small className={styles.settings__helperText}>
                JPG, PNG, or GIF. Max size 2MB.
              </small>
            </div>

            <div className={styles.settings__fieldGroup}>
              <label className={styles.settings__label}>Username</label>
              <input
                type="text"
                value="current_user"
                disabled
                className={styles.settings__input}
              />
            </div>

            <div className={styles.settings__fieldGroup}>
              <label className={styles.settings__label}>Email Address</label>
              <input
                type="email"
                value="user@sample.com"
                disabled
                className={styles.settings__input}
              />
              <small className={styles.settings__helperText}>
                Email cannot be changed.
              </small>
            </div>

            <div className={styles.settings__fieldGroup}>
              <label className={styles.settings__label}>
                Tell us a little about yourself
              </label>
              <textarea rows="4" className={styles.settings__textarea} />
            </div>

            <button type="submit" className={styles.settings__saveButton}>
              Save Profile Changes
            </button>
          </form>
        </section>
      </div>

      <footer className={styles.settings__footer}>
        <div className={styles.settings__footerLeft}>
          <h4 className={styles.settings__footerBrand}>BlogHub</h4>
          <p>© 2025 BlogHub. All rights reserved.</p>
        </div>
        <div className={styles.settings__footerRight}>
          <div className={styles.settings__footerColumn}>
            <h5>Quick Links</h5>
            <ul>
              <li>Home</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className={styles.settings__footerColumn}>
            <h5>Popular Topics</h5>
            <ul>
              <li>Tech</li>
              <li>Travel</li>
              <li>Design</li>
            </ul>
          </div>
          <div className={styles.settings__footerColumn}>
            <h5>Subscribe</h5>
            <input type="email" placeholder="Subscribe to newsletter" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SettingsPage;
