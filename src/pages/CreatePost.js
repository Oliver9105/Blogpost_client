import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../CreatePost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
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

  useEffect(() => {
    fetch("https://blogpost-app-3gtr.onrender.com/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoadingTags(true);
    fetch("https://blogpost-app-3gtr.onrender.com/tags")
      .then((res) => res.json())
      .then((data) => {
        setTags(data);
        setIsLoadingTags(false);
      })
      .catch(() => setIsLoadingTags(false));
  }, []);

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    const selectedCategory = categories.find((c) => c.name === category);
    try {
      const res = await fetch("https://blogpost-app-3gtr.onrender.com/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          category_id: selectedCategory?.id || 1,
        }),
      });
      const newTag = await res.json();
      setTags((prev) => [...prev, newTag]);
      setSelectedTags((prev) => [...prev, newTag.id]);
      setNewTagName("");
    } catch {
      setError("Failed to create tag.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous errors
    setError(null);

    // Validate file type
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

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setFeaturedImage(file);

    // Create preview using FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
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
        "https://blogpost-app-3gtr.onrender.com/api/upload",
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

      const selectedCategory = categories.find((c) => c.name === category);

      const postData = {
        title,
        content,
        excerpt,
        user_id: currentUser?.id,
        category_id: selectedCategory?.id,
        featured_image: imageUrl,
        tag_ids: selectedTags,
      };

      const res = await fetch("https://blogpost-app-3gtr.onrender.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to publish post.");
      }

      const result = await res.json();
      alert("Post published successfully!");
      navigate(`/posts/${result.id}`);
    } catch (err) {
      setError(err.message || "Failed to publish post.");
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

  // Filter tags based on selected category
  const filteredTags = tags.filter((tag) => {
    if (!category) return true;
    const selectedCategory = categories.find((c) => c.name === category);
    return tag.category_id === selectedCategory?.id;
  });

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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        {/* Tags Selection */}
        <div className="cp-label">
          Tags <span className="cp-optional">(Optional)</span>
          <div className="cp-tags-container">
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
                  className="cp-text-button"
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
                  const tag = tags.find((t) => t.id === tagId);
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
  );
};

export default CreatePost;
