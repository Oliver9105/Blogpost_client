import { useState, useEffect, useRef } from "react";
import "../CreatePost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const fileInputRef = useRef(null);

  // Get current user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Fetch available tags from backend
  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const response = await fetch("http://localhost:5555/tags");
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      } else {
        console.error("Failed to fetch tags:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const getCategoryId = (name) => {
    const map = {
      tech: 1,
      lifestyle: 2,
      travel: 3,
    };
    return map[name] || null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPEG, PNG, GIF)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      setFeaturedImage(file);
      setError("");

      // Create preview
      try {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } catch (error) {
        console.warn(
          "URL.createObjectURL failed, using alternative preview method"
        );
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFeaturedImage(null);
      setImagePreview(null);
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch("http://localhost:5555/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          category_id: getCategoryId(category) || 1,
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags((prev) => [...prev, newTag]);
        setSelectedTags((prev) => [...prev, newTag.id]);
        setNewTagName("");
        setError("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      setError(error.message || "Failed to create new tag. Please try again.");
    }
  };

  const clearImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!currentUser) {
      setError("You must be logged in to create a post");
      setIsLoading(false);
      return;
    }

    try {
      let featuredImageBase64 = null;
      if (featuredImage) {
        featuredImageBase64 = await convertImageToBase64(featuredImage);
      }

      const postData = {
        title,
        content,
        excerpt,
        user_id: currentUser.id,
        category_id: getCategoryId(category),
        featured_image: featuredImageBase64,
        tag_ids: selectedTags,
      };

      const response = await fetch("http://localhost:5555/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Post published successfully:", result);

      // Reset form
      setTitle("");
      setCategory("");
      setExcerpt("");
      setContent("");
      setFeaturedImage(null);
      setImagePreview(null);
      setSelectedTags([]);
      setNewTagName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Post published successfully!");
    } catch (error) {
      console.error("Failed to publish post:", error);
      setError(error.message || "Failed to publish post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      excerpt,
      content,
      imagePreview,
      selectedTags,
    };
    localStorage.setItem("postDraft", JSON.stringify(draftData));
    alert("Draft saved locally!");
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      setTitle("");
      setCategory("");
      setExcerpt("");
      setContent("");
      setFeaturedImage(null);
      setImagePreview(null);
      setSelectedTags([]);
      setNewTagName("");
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // SIMPLE CLIENT-SIDE TAG FILTERING
  const filteredTags = availableTags.filter((tag) => {
    if (!category) return true; // Show all tags when no category selected

    const currentCategoryId = getCategoryId(category);
    return tag.category_id === currentCategoryId;
  });

  return (
    <div>
      <main className="cp-container">
        <nav className="cp-breadcrumb">
          <a href="/">Home</a> <span>›</span> <span>Create Post</span>
        </nav>

        <h1 className="cp-heading">Create New Post</h1>
        <p className="cp-subheading">
          Compose your article and share it with the world.
        </p>

        {!currentUser && (
          <div className="cp-warning">
            Warning: You are not logged in. Please <a href="/signin">sign in</a>{" "}
            to create posts.
          </div>
        )}

        {error && <div className="cp-error">{error}</div>}

        <form className="cp-form" onSubmit={handleSubmit}>
          <label className="cp-label" htmlFor="title">
            Post Title
            <input
              type="text"
              id="title"
              className="cp-input"
              placeholder="Enter an engaging title for your post"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading || !currentUser}
            />
          </label>

          <label className="cp-label" htmlFor="category">
            Category
            <select
              id="category"
              className="cp-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isLoading || !currentUser}
            >
              <option value="">Select a category</option>
              <option value="tech">Tech</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="travel">Travel</option>
            </select>
          </label>

          {/* Tags Selection */}
          <div className="cp-label">
            Tags <span className="cp-optional">(Optional)</span>
            <div className="cp-tags-container">
              {/* Tags List */}
              {isLoadingTags ? (
                <div className="cp-loading-tags">Loading tags...</div>
              ) : filteredTags.length > 0 ? (
                <div className="cp-tags-list">
                  {filteredTags.map((tag) => (
                    <label key={tag.id} className="cp-tag-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        disabled={isLoading || !currentUser}
                      />
                      <span className="cp-tag-label">{tag.name}</span>
                    </label>
                  ))}
                </div>
              ) : category ? (
                <div className="cp-no-tags">
                  No tags available for {category}.{" "}
                  <button
                    type="button"
                    onClick={() => setNewTagName("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Create a new tag
                  </button>
                </div>
              ) : (
                <div className="cp-no-tags">
                  No tags available. Create one below!
                </div>
              )}

              {/* Add New Tag */}
              <div className="cp-new-tag">
                <input
                  type="text"
                  placeholder={
                    category
                      ? `Create new ${category} tag...`
                      : "Create new tag..."
                  }
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  disabled={isLoading || !currentUser}
                  className="cp-new-tag-input"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  disabled={isLoading || !currentUser || !newTagName.trim()}
                  className="cp-add-tag-btn"
                >
                  Add Tag
                </button>
              </div>

              {/* Selected Tags Preview */}
              {selectedTags.length > 0 && (
                <div className="cp-selected-tags">
                  <strong>Selected tags:</strong>
                  {selectedTags.map((tagId) => {
                    const tag = availableTags.find((t) => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="cp-selected-tag">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleTagToggle(tagId)}
                          className="cp-remove-tag-btn"
                          title="Remove tag"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          <label className="cp-label" htmlFor="excerpt">
            Excerpt / Summary <span className="cp-optional">(Optional)</span>
            <textarea
              id="excerpt"
              className="cp-textarea"
              placeholder="Write a short, compelling summary to catch your reader's attention."
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={isLoading || !currentUser}
            />
          </label>

          <label className="cp-label" htmlFor="image">
            Featured Image <span className="cp-optional">(Optional)</span>
            <input
              type="file"
              id="image"
              ref={fileInputRef}
              accept="image/*"
              className="cp-input"
              onChange={handleImageChange}
              disabled={isLoading || !currentUser}
            />
            <small className="cp-help-text">
              Max 5MB. Supported formats: JPG, PNG, GIF, WEBP
            </small>
            {imagePreview && (
              <div className="cp-imagePreview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="cp-previewImg"
                />
                <button
                  type="button"
                  className="cp-remove-image"
                  onClick={clearImage}
                  disabled={isLoading}
                >
                  × Remove Image
                </button>
              </div>
            )}
          </label>

          <label className="cp-label" htmlFor="content">
            Post Content
            <div className="cp-editorToolbar">
              <button type="button" title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" title="Italic">
                <em>I</em>
              </button>
              <button type="button" title="Underline">
                <u>U</u>
              </button>
              <button type="button" title="Link">
                🔗
              </button>
              <button type="button" title="List">
                • List
              </button>
            </div>
            <textarea
              id="content"
              className="cp-editor"
              placeholder="Start writing your masterpiece..."
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isLoading || !currentUser}
            />
          </label>

          <div className="cp-actions">
            <button
              type="button"
              className="cp-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="cp-secondary"
              onClick={handleSaveDraft}
              disabled={isLoading || !currentUser}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="cp-primary"
              disabled={isLoading || !currentUser}
            >
              {isLoading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePost;
