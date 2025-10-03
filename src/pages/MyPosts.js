import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../MyPosts.css";

const MyPosts = ({ isAuthenticated, user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setError("You must be logged in to view your posts");
      setLoading(false);
      return;
    }

    const fetchUserPosts = async () => {
      try {
        if (!user || !user.id) throw new Error("User not found");

        const response = await fetch(
          `https://blogpost-app-qbhg.onrender.com/posts/my-posts?user_id=${user.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        setError("Failed to load your posts");
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [isAuthenticated, user]);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://blogpost-app-qbhg.onrender.com/posts/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      alert("Failed to delete post");
      console.error("Error deleting post:", err);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="my-posts-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>You need to be logged in to view your posts.</p>
          <Link to="/signin" className="auth-button primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-posts-container">
        <div className="loading">Loading your posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-posts-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-posts-container">
      <div className="my-posts-header">
        <h1>My Posts</h1>
        <Link to="/create" className="create-new-button">
          <i className="fas fa-plus"></i> Create New Post
        </Link>
      </div>

      <div className="filter-tabs">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "published" ? "active" : ""}
          onClick={() => setFilter("published")}
        >
          Published
        </button>
        <button
          className={filter === "draft" ? "active" : ""}
          onClick={() => setFilter("draft")}
        >
          Drafts
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <h2>No {filter !== "all" ? filter : ""} posts found</h2>
          <p>Start sharing your thoughts with the community!</p>
          <Link to="/create" className="create-first-button">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="posts-list">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              {post.featured_image && (
                <img
                  src={
                    post.featured_image.startsWith("http")
                      ? post.featured_image
                      : `https://blogpost-app-qbhg.onrender.com${post.featured_image}`
                  }
                  alt={post.title}
                  className="post-image"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div className="post-content">
                <h2 className="post-title">{post.title}</h2>

                {/* Display tags */}
                {post.tags?.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag.id} className="post-tag">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="post-excerpt">
                  {post.content?.split(" ").slice(0, 20).join(" ")}...
                </p>
                <div className="post-meta">
                  <span className="post-date">
                    Created: {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`post-status ${
                      post.published ? "status-published" : "status-draft"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="post-actions">
                <Link
                  to={`/edit/${post.id}`}
                  className="edit-button"
                  onClick={(e) => e.stopPropagation()} // stop card navigation
                >
                  <i className="fas fa-edit"></i> Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // stop card navigation
                    handleDelete(post.id);
                  }}
                  className="delete-button"
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
