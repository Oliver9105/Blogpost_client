import { useState } from "react";
import "../CreatePost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // Replace with actual user ID from auth context/session
  const userId = 1;

  // Map category name to backend category ID
  const getCategoryId = (name) => {
    const map = {
      tech: 1,
      lifestyle: 2,
      travel: 3,
    };
    return map[name] || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      title,
      content,
      user_id: userId,
      category_id: getCategoryId(category),
      tag_ids: [], // Optional: add tag support later
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
      // Optionally reset form or redirect
    } catch (error) {
      console.error("Failed to publish post:", error);
    }
  };

  const handleSaveDraft = () => {
    const draftData = { title, category, excerpt, content };
    console.log("Saving draft:", draftData);
    // TODO: Save locally or via API
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
            placeholder="Write a short, compelling summary to catch your reader’s attention."
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
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
  );
};

export default CreatePost;
