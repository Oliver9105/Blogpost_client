import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const initialVisibleCount = 3;
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Fetch user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  // Fetch posts + categories + tags
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5555/posts");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPosts(data.filter((post) => post.published));
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("http://localhost:5555/categories");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const response = await fetch("http://localhost:5555/tags");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTags(data);
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchPosts();
    fetchCategories();
    fetchTags();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setVisibleCount(initialVisibleCount);
  };

  const handleTagClick = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
    setVisibleCount(initialVisibleCount);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setSearch("");
    setVisibleCount(initialVisibleCount);
  };

  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = post.title
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = selectedCategory
        ? post.category?.id === selectedCategory
        : true;
      const matchesTags =
        selectedTags.length > 0
          ? selectedTags.every((tagId) =>
              post.tags?.some((tag) => tag.id === tagId)
            )
          : true;
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

  const visiblePosts =
    selectedCategory || selectedTags.length > 0
      ? filteredPosts
      : filteredPosts.slice(0, visibleCount);

  // Category counts
  const categoryPostCounts = {};
  posts.forEach((post) => {
    if (post.category && post.category.id) {
      categoryPostCounts[post.category.id] =
        (categoryPostCounts[post.category.id] || 0) + 1;
    }
  });

  // Tag counts
  const tagPostCounts = {};
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagPostCounts[tag.id] = (tagPostCounts[tag.id] || 0) + 1;
      });
    }
  });

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-hero">
          <h1>Welcome to BlogHub</h1>
          <p>Your space to share stories, insights, and ideas.</p>
        </div>
        <div className="loading-posts">⏳ Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero */}
      <section className="home-hero">
        <h1>Welcome to BlogHub ✨</h1>
        <p>Your space to share stories, insights, and ideas.</p>
        <div className="home-hero-buttons">
          {user ? (
            <Link to="/create" className="home-hero-button primary">
              ✏️ Write New Post
            </Link>
          ) : (
            <>
              <Link to="/login" className="home-hero-button">
                🔑 Login
              </Link>
              <Link to="/register" className="home-hero-button primary">
                📝 Sign Up
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Toolbar */}
      <div className="home-toolbar">
        <div className="search-container">
          <input
            type="text"
            className="home-search-input"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters ❌" : "Show Filters 🔍"}
          </button>
        </div>

        <select
          className="home-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Sort: Latest 🆕</option>
          <option value="oldest">Sort: Oldest 📜</option>
          <option value="popular">Sort: Most Comments 💬</option>
        </select>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-section">
            <h3>Categories 📂</h3>
            <div className="filter-tags">
              {categoriesLoading ? (
                <span>Loading categories...</span>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    className={`filter-tag ${
                      selectedCategory === category.id ? "active" : ""
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name} ({categoryPostCounts[category.id] || 0})
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="filter-section">
            <h3>Tags 🔖</h3>
            <div className="filter-tags">
              {tagsLoading ? (
                <span>Loading tags...</span>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`filter-tag ${
                      selectedTags.includes(tag.id) ? "active" : ""
                    }`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    #{tag.name} ({tagPostCounts[tag.id] || 0})
                  </button>
                ))
              )}
            </div>
          </div>

          {(selectedCategory || selectedTags.length > 0) && (
            <button className="clear-filters" onClick={clearAllFilters}>
              🧹 Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Posts */}
      <section className="home-posts-section">
        <h2 className="home-section-title">
          {selectedCategory
            ? `Posts in ${
                categories.find((c) => c.id === selectedCategory)?.name ||
                "Category"
              }`
            : "Recent Posts"}
        </h2>

        <div className="home-posts-grid">
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => (
              <div
                key={post.id}
                className="home-post-card"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <div className="home-post-image">
                  {post.featured_image ? (
                    <img
                      src={
                        post.featured_image.startsWith("http")
                          ? post.featured_image
                          : `http://localhost:5555${post.featured_image}`
                      }
                      alt={post.title}
                      className="home-post-thumbnail-img"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <span className="home-post-thumbnail">📝</span>
                  )}
                </div>

                <div className="home-post-content">
                  {post.category?.name && (
                    <span className="home-post-category">
                      📂 {post.category.name}
                    </span>
                  )}
                  {post.tags?.length > 0 && (
                    <div className="home-post-tags">
                      {post.tags.map((tag) => (
                        <span key={tag.id} className="home-post-tag">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="home-post-title"> {post.title}</h3>
                  <p className="home-post-excerpt">{post.excerpt}</p>
                  <div className="home-post-meta">
                    <span>
                      👤 {post.owner?.username || "Unknown"} • 🗓{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.comments && (
                      <span className="comment-count">
                        💬 {post.comments.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts-message">
              No posts found for the current filters. 🔍
            </p>
          )}
        </div>

        {/* Load More button */}
        {!selectedCategory &&
          selectedTags.length === 0 &&
          visibleCount < filteredPosts.length && (
            <button
              className="home-load-more"
              onClick={() =>
                setVisibleCount((prev) => prev + initialVisibleCount)
              }
            >
              Load More Posts ⬇️
            </button>
          )}
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
