import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5555/posts");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5555/categories");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchPosts();
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Clear filter if same category is clicked again
    } else {
      setSelectedCategory(categoryId);
    }
    setVisibleCount(6); // Reset visible count when changing category
  };

  const filteredPosts = posts
    .filter((post) => {
      // Filter by search term
      const matchesSearch = post.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      // Filter by selected category
      const matchesCategory = selectedCategory
        ? post.category?.id === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  // Calculate post counts for each category
  const categoryPostCounts = {};
  posts.forEach((post) => {
    if (post.category && post.category.id) {
      categoryPostCounts[post.category.id] =
        (categoryPostCounts[post.category.id] || 0) + 1;
    }
  });

  if (loading) {
    return <div className="home-container">Loading posts...</div>;
  }

  return (
    <div className="home-container">
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

      {/* Categories */}
      <section className="home-categories">
        <h2 className="home-section-title">Explore Popular Categories</h2>
        {categoriesLoading ? (
          <div className="categories-loading">Loading categories...</div>
        ) : (
          <div className="home-categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`home-category-card ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="home-category-icon">📁</div>
                <div className="home-category-label">{category.name}</div>
                <div className="home-category-count">
                  {categoryPostCounts[category.id] || 0} posts
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Posts */}
      <section className="home-posts-section">
        <div className="posts-header">
          <h2 className="home-section-title">
            {selectedCategory
              ? `Posts in ${
                  categories.find((c) => c.id === selectedCategory)?.name ||
                  "Category"
                }`
              : "Recent Posts"}
          </h2>
          {selectedCategory && (
            <button
              className="clear-filter-button"
              onClick={() => setSelectedCategory(null)}
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="home-posts-grid">
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => (
              <div key={post.id} className="home-post-card">
                <div className="home-post-image">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="home-post-thumbnail-img"
                    />
                  ) : (
                    <span className="home-post-thumbnail">
                      {post.title?.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="home-post-content">
                  {post.category?.name && (
                    <span className="home-post-category">
                      {post.category.name}
                    </span>
                  )}

                  {post.tags?.length > 0 && (
                    <div className="home-post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="home-post-tag">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="home-post-title">{post.title}</h3>
                  <p className="home-post-excerpt">
                    {post.content?.substring(0, 120)}...
                  </p>

                  <div className="home-post-meta">
                    <span>
                      By {post.author?.username || "Unknown"}
                      {post.created_at && (
                        <> • {new Date(post.created_at).toLocaleDateString()}</>
                      )}
                    </span>
                  </div>

                  <Link to={`/posts/${post.id}`} className="home-post-link">
                    Read More →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts-message">
              {selectedCategory
                ? `No posts found in this category. ${
                    search ? "Try a different search term." : ""
                  }`
                : `No posts found. ${
                    search ? "Try a different search term." : ""
                  }`}
            </p>
          )}
        </div>

        {visibleCount < filteredPosts.length && (
          <button
            className="home-load-more"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            Load More Posts
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
