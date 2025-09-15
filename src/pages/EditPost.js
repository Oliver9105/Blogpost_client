import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../EditPost.css";

const API_BASE = "http://localhost:5555";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE}/posts/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        setTitle(data.title || "");
        setContent(data.content || "");
        setFeaturedImage(
          data.featured_image ? `${API_BASE}${data.featured_image}` : ""
        );
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };

    if (id) fetchPost();
  }, [id]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (featuredImageFile) {
        formData.append("featured_image", featuredImageFile);
      }

      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update post");

      console.log("✅ Post updated successfully!");
      navigate(`/posts/${id}`); // redirect back to post
    } catch (err) {
      console.error("❌ Error saving post:", err);
    }
  };

  return (
    <div className="edit-post-container">
      <h1 className="edit-post-title">Edit Post</h1>
      <p className="edit-post-subtitle">
        Make changes and preview before saving
      </p>

      <div className="edit-post-grid">
        <form className="edit-post-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label htmlFor="featuredImage">Featured Image</label>
          <input
            type="file"
            id="featuredImage"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFeaturedImageFile(file);
                setFeaturedImage(URL.createObjectURL(file)); // live preview
              }
            }}
          />

          <div className="form-footer">
            <div className="formatting-toggle">
              <input
                type="checkbox"
                id="previewToggle"
                checked={showPreview}
                onChange={() => setShowPreview(!showPreview)}
              />
              <label htmlFor="previewToggle">Show live preview</label>
            </div>
          </div>
        </form>

        {showPreview && (
          <div className="edit-post-preview">
            <h2 className="preview-title">{title || "Untitled Post"}</h2>
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Featured"
                className="preview-image"
              />
            )}
            <div className="preview-content">
              {content || "Start typing to see preview..."}
            </div>
            <button type="button" className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPost;
