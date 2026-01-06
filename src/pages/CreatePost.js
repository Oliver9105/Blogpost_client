import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../CreatePost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(null); // category ID
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:5555/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Fetch tags
  useEffect(() => {
    setIsLoadingTags(true);
    fetch("http://localhost:5555/tags")
      .then((res) => res.json())
      .then((data) => {
        setTags(data);
        setIsLoadingTags(false);
      })
      .catch(() => setIsLoadingTags(false));
  }, []);

  const handleCategoryChange = (e) => {
    const val = Number(e.target.value);
    setCategory(val);
    setSelectedTags([]);
    setNewTagName("");
  };

  const selectedCategory = categories.find((c) => c.id === category);

  // Filter tags dynamically based on selected category
  const filteredTags = category
    ? tags.filter((tag) => tag.category_id === category)
    : [];

  // Handle new tag creation
  const handleAddNewTag = async () => {
    if (!newTagName.trim() || !category) return;

    try {
      const res = await fetch("http://localhost:5555/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          category_id: category,
        }),
      });

      if (!res.ok) throw new Error("Failed to create tag");

      const newTag = await res.json();
      setTags((prev) => [...prev, newTag]);
      setSelectedTags((prev) => [...prev, newTag.id]);
      setNewTagName("");
    } catch (err) {
      setError(err.message || "Failed to create tag");
    }
  };

  // Image handling remains the same
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setFeaturedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.onerror = () => {
      setError("Failed to load image preview.");
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        "http://localhost:5555/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(error.message || "Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      if (featuredImage) {
        imageUrl = await uploadImage(featuredImage);
      }

      const postData = {
        title,
        content,
        excerpt,
        user_id: currentUser?.id,
        category_id: category,
        featured_image: imageUrl,
        tag_ids: selectedTags,
      };

      const res = await fetch("http://localhost:5555/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || `Server error: ${res.status}`);
      }

      navigate(`/posts/${responseData.id}`);
    } catch (err) {
      setError(
        err.message ||
          "Failed to publish post. Please check your data and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      selectedTags,
      excerpt,
      content,
      imagePreview,
    };
    localStorage.setItem("draftPost", JSON.stringify(draftData));
    alert("Draft saved!");
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      navigate("/");
    }
  };

  return (
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
          <span>⚠️</span> You are not logged in. Please{" "}
          <a href="/signin">sign in</a> to create posts.
        </div>
      )}

      {error && <div className="cp-error">{error}</div>}

      <form className="cp-form" onSubmit={handleSubmit}>
        {/* Title */}
        <label className="cp-label" htmlFor="title">
          Post Title
          <input
            type="text"
            id="title"
            className="cp-input"
            placeholder="Enter an engaging title"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading || !currentUser}
            autoFocus
          />
        </label>

        {/* Category */}
        <label className="cp-label" htmlFor="category">
          Category
          <select
            id="category"
            className="cp-select"
            value={category || ""}
            onChange={handleCategoryChange}
            required
            disabled={isLoading || !currentUser}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        {/* Tags Section */}
        <div className="cp-label">
          Tags <span className="cp-optional">(Optional)</span>
          <div className="cp-tags-container">
            {isLoadingTags ? (
              <div className="cp-loading-tags">Loading tags...</div>
            ) : category ? (
              filteredTags.length > 0 ? (
                <div className="cp-tags-list">
                  {filteredTags.map((tag) => (
                    <span key={tag.id} className="cp-tag">
                      #{tag.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag.id)
                              ? prev.filter((id) => id !== tag.id)
                              : [...prev, tag.id]
                          )
                        }
                        className="cp-tag-toggle"
                        title={
                          selectedTags.includes(tag.id)
                            ? "Remove tag"
                            : "Add tag"
                        }
                      >
                        {selectedTags.includes(tag.id) ? "×" : "+"}
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="cp-no-tags">
                  No tags for <strong>{selectedCategory?.name}</strong>.
                </div>
              )
            ) : (
              <div className="cp-no-tags">
                Please select a category to see available tags.
              </div>
            )}

            {/* New Tag Creation */}
            <div className="cp-new-tag">
              <input
                type="text"
                placeholder={
                  selectedCategory
                    ? `Create new ${selectedCategory.name} tag...`
                    : "Create new tag..."
                }
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                disabled={isLoading || !currentUser || !category}
                className="cp-new-tag-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddNewTag}
                disabled={
                  isLoading || !currentUser || !newTagName.trim() || !category
                }
                className="cp-add-tag-btn"
                title="Add tag"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <label className="cp-label" htmlFor="excerpt">
          Excerpt / Summary <span className="cp-optional">(Optional)</span>
          <textarea
            id="excerpt"
            className="cp-textarea"
            placeholder="Write a short summary..."
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            disabled={isLoading || !currentUser}
          />
        </label>

        {/* Featured Image */}
        <label className="cp-label" htmlFor="image">
          Featured Image <span className="cp-optional">(Optional)</span>
          <input
            type="file"
            id="image"
            ref={fileInputRef}
            accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
            className="cp-input"
            onChange={handleImageChange}
            disabled={isLoading || !currentUser}
          />
          <small className="cp-help-text">
            Max 5MB. Supported formats: JPG, PNG, GIF, WEBP
          </small>
          {imagePreview && (
            <div className="cp-imagePreview">
              <img src={imagePreview} alt="Preview" className="cp-previewImg" />
              <button
                type="button"
                className="cp-remove-image"
                onClick={clearImage}
                disabled={isLoading}
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </label>

        {/* Post Content */}
        <label className="cp-label" htmlFor="content">
          Post Content
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

        {/* Actions */}
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
  );
};

export default CreatePost;
