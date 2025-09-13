import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../ViewPost.css";

function ViewPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `https://blogpost-app-3gtr.onrender.com/posts/${id}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!post) return <p>No post found</p>;

  return (
    <div className="view-post">
      <h1 className="view-post-title">{post.title}</h1>
      <p className="view-post-meta">
        By <strong>{post.author?.username || "Unknown"}</strong>{" "}
        {post.category?.name && (
          <>
            in <em>{post.category.name}</em>
          </>
        )}
        {post.created_at && (
          <> • {new Date(post.created_at).toLocaleDateString()}</>
        )}
      </p>

      {/* Render image like Home.js */}
      <div className="view-post-image-wrapper">
        {post.featured_image ? (
          <img
            src={
              post.featured_image.startsWith("http")
                ? post.featured_image
                : `https://blogpost-app-3gtr.onrender.com${post.featured_image}`
            }
            alt={post.title}
            className="view-post-image"
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <span
          className="view-post-thumbnail"
          style={{ display: post.featured_image ? "none" : "flex" }}
        >
          {post.title?.charAt(0)}
        </span>
      </div>

      <p className="view-post-excerpt">{post.excerpt}</p>
      <div className="view-post-content">{post.content}</div>

      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
}

export default ViewPost;
