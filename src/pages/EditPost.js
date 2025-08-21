import React, { useState } from "react";

import "../EditPost.css";

const EditPost = ({ initialTitle = "", initialContent = "", onSave }) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = () => {
    if (onSave) {
      onSave({ title, content });
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
            <div className="preview-content">
              {content || "Start typing to see preview..."}
            </div>
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPost;
