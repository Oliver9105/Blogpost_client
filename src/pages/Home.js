import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Home.css";

const POSTS_PER_PAGE = 3;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    fetch("https://blogpost-app-br7f.onrender.com/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const filteredPosts = posts
    .filter((post) => post.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-navbar">
        <div className="home-navbar-left">
          <div className="home-logo">BlogHub</div>
        </div>
        <nav className="home-navbar-center">
          <Link to="/" className="home-nav-link">
            Home
          </Link>
          <Link to="/create" className="home-nav-link">
            Write Post
          </Link>
        </nav>
        <div className="home-navbar-right">
          <Link to="/register" className="home-auth-button">
            Register
          </Link>
          <Link to="/signin" className="home-auth-button secondary">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <h1>Welcome to BlogHub</h1>
        <p>Your space to share stories, insights, and ideas.</p>
        <div className="home-hero-buttons">
          <Link to="/" className="home-hero-button secondary">
            Explore Posts
          </Link>
          <Link to="/create" className="home-hero-button primary">
            Write New Post
          </Link>
        </div>
      </section>

      {/* Toolbar */}
      <div className="home-toolbar">
        <input
          type="text"
          className="home-search-input"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="home-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Sort by: Latest</option>
          <option value="oldest">Sort by: Oldest</option>
        </select>
      </div>

      {/* Posts */}
      <section className="home-posts-section">
        <h2 className="home-section-title">Recent Posts</h2>
        <div className="home-posts-grid">
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => (
              <div key={post.id} className="home-post-card">
                <div className="home-post-image">
                  <span className="home-post-thumbnail">
                    {post.title?.charAt(0)}
                  </span>
                </div>
                <div className="home-post-content">
                  {post.tag && (
                    <span className="home-post-tag">{post.tag}</span>
                  )}
                  <h3 className="home-post-title">{post.title}</h3>
                  <p className="home-post-excerpt">
                    {post.content?.substring(0, 120)}...
                  </p>
                  <div className="home-post-meta">
                    <span>
                      {post.user ? `By ${post.user}` : ""}
                      {post.created_at
                        ? ` • ${new Date(post.created_at).toLocaleDateString()}`
                        : ""}
                    </span>
                  </div>
                  <Link to={`/posts/${post.id}`} className="home-post-link">
                    View Post →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No posts found.</p>
          )}
        </div>
        {visibleCount < filteredPosts.length && (
          <button
            className="home-load-more"
            onClick={() => setVisibleCount((prev) => prev + POSTS_PER_PAGE)}
          >
            Load More Posts
          </button>
        )}
      </section>

      {/* Categories */}
      <section className="home-categories">
        <h2 className="home-section-title">Explore Popular Categories</h2>
        <div className="home-categories-grid">
          {["Technology", "Business", "Design", "Lifestyle"].map((category) => (
            <div key={category} className="home-category-card">
              <div className="home-category-icon">📁</div>
              <div className="home-category-label">{category}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-top">
          <aside className="footer-column">
            <h3>BlogHub</h3>
            <p>Share your thoughts with the world</p>
            <p>Join our community of writers</p>
            <p>Engage in meaningful discussions</p>
          </aside>

          <nav className="footer-column" aria-label="Quick Links">
            <h4>Quick Links</h4>
            <p>Latest Posts</p>
            <p>Write a Post</p>
            <p>Join Community</p>
          </nav>

          <nav className="footer-column" aria-label="Popular Topics">
            <h4>Popular Topics</h4>
            <p>Technology</p>
            <p>Business</p>
            <p>Design</p>
            <p>Lifestyle</p>
          </nav>

          <nav className="footer-column" aria-label="Stay Connected">
            <h4>Stay Connected</h4>
            <form className="footer-newsletter">
              <input type="email" placeholder="Your email" />
              <button type="submit">→</button>
            </form>
          </nav>
        </div>

        <div className="home-footer-bottom">
          <p>© 2025 BlogHub. All rights reserved.</p>
          <nav className="footer-links-inline" aria-label="Legal Links">
            <Link to="/privacy">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms">Terms of Service</Link>
            <span>·</span>
            <Link to="/community">Community Guidelines</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Home;
