import { useState } from "react";
import { Link } from "react-router-dom";
import "../CreatePost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = 1;

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
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      title,
      content,
      user_id: userId,
      category_id: getCategoryId(category),
      tag_ids: [],
    };

    try {
      const response = await fetch(
        "https://blogpost-app-br7f.onrender.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Post published successfully:", result);
    } catch (error) {
      console.error("Failed to publish post:", error);
    }
  };

  const handleSaveDraft = () => {
    const draftData = { title, category, excerpt, content };
    console.log("Saving draft:", draftData);
  };

  const handleWritePost = () => {
    // This function can be used to navigate to the create post page
    // Since we're already on the create post page, we might not need to do anything
    // Or we could refresh the page to start a new post
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div>
      <header className="cp-header">
        <div className="cp-header-container">
          <Link to="/" className="cp-header-logo">
            BlogHub
          </Link>
          <nav className="cp-header-nav-links">
            <Link to="/" className="cp-header-nav-link">
              Home
            </Link>
            <button
              className="cp-header-write-button"
              onClick={handleWritePost}
            >
              Write Post
            </button>
          </nav>
          <form className="cp-header-search-bar" onSubmit={handleSearch}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </header>

      <main className="cp-container">
        <nav className="cp-breadcrumb">
          <a href="/">Home</a> <span>›</span> <span>Create Post</span>
        </nav>

        <h1 className="cp-heading">Create New Post</h1>
        <p className="cp-subheading">
          Compose your article and share it with the world.
        </p>

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
            >
              <option value="">Select a category</option>
              <option value="tech">Tech</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="travel">Travel</option>
            </select>
          </label>

          <label className="cp-label" htmlFor="excerpt">
            Excerpt / Summary <span className="cp-optional">(Optional)</span>
            <textarea
              id="excerpt"
              className="cp-textarea"
              placeholder="Write a short, compelling summary to catch your reader's attention."
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </label>

          <label className="cp-label" htmlFor="image">
            Featured Image <span className="cp-optional">(Optional)</span>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="cp-input"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="cp-imagePreview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="cp-previewImg"
                />
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
            />
          </label>

          <div className="cp-actions">
            <button type="reset" className="cp-secondary">
              Cancel
            </button>
            <button
              type="button"
              className="cp-secondary"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
            <button type="submit" className="cp-primary">
              Publish Post
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePost;
