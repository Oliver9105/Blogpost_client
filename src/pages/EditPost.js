import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../EditPost.css";

const API_BASE = "http://localhost:5555";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [tagIds, setTagIds] = useState([]);
  const [, setError] = useState(null); // error value unused
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [relatedPosts, setRelatedPosts] = useState([]);

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
        setExcerpt(data.excerpt || "");
        setCategoryId(data.category?.id || data.category_id || null);
        setTagIds(data.tags ? data.tags.map((t) => t.id) : data.tag_ids || []);

        if (data.featured_image) {
          setFeaturedImage(
            data.featured_image.startsWith("http")
              ? data.featured_image
              : `${API_BASE}${data.featured_image}`
          );
        } else {
          setFeaturedImage("");
        }

        // Fetch related posts (published only, exclude current)
        const relatedRes = await fetch(`${API_BASE}/posts`);
        if (relatedRes.ok) {
          const allPosts = await relatedRes.json();
          const publishedRelated = allPosts.filter(
            (p) => p.id !== data.id && p.published
          );
          setRelatedPosts(publishedRelated.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };

    if (id) fetchPost();
  }, [id]);

  // Minimal markdown -> HTML renderer
  const escapeHtml = useCallback(
    (str) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;"),
    []
  );

  const markdownToHtml = useCallback(
    (md) => {
      if (!md) return "";
      let html = escapeHtml(md);

      html = html.replace(
        /```([\s\S]*?)```/g,
        (m, code) => `<pre><code>${escapeHtml(code)}</code></pre>`
      );
      html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
      html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
      html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
      html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
      html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
      html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
      html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
      html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
      html = html.replace(
        /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/gim,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      html = html.replace(/^\s*[-*+] (.*)$/gim, "<li>$1</li>");
      html = html.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");
      html = html.replace(/\n{2,}/gim, "</p><p>");
      html = `<p>${html}</p>`;
      html = html.replace(/<p>\s*<\/p>/gim, "");

      return html;
    },
    [escapeHtml]
  );

  // Update preview HTML
  useEffect(() => {
    if (useMarkdown) {
      setPreviewHtml(markdownToHtml(content));
    } else {
      const escaped = escapeHtml(content || "");
      setPreviewHtml(escaped.replace(/\n/g, "<br/>"));
    }
  }, [content, useMarkdown, markdownToHtml, escapeHtml]);

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("You must be logged in to edit this post.");
      return;
    }

    try {
      let imageUrl = null;
      if (featuredImageFile) {
        const imgForm = new FormData();
        imgForm.append("image", featuredImageFile);
        const uploadRes = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: imgForm,
        });
        if (!uploadRes.ok)
          throw new Error(`Image upload failed (status ${uploadRes.status})`);
        const uploadData = await uploadRes.json().catch(() => null);
        imageUrl =
          (uploadData &&
            (uploadData.url || uploadData.path || uploadData.file?.url)) ||
          null;
        if (imageUrl && !imageUrl.startsWith("http"))
          imageUrl = `${API_BASE}${imageUrl}`;
      }

      const payload = {
        title,
        excerpt: excerpt || (content ? content.slice(0, 200) : ""),
        content,
        user_id: user.id,
        category_id: categoryId || 1,
        tag_ids: tagIds && tagIds.length > 0 ? tagIds : [1],
        published: true,
      };
      if (imageUrl) payload.featured_image = imageUrl;

      const token = localStorage.getItem("token");
      const baseHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const attemptJsonUpdate = async (method, url, extraHeaders = {}) =>
        await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...baseHeaders,
            ...extraHeaders,
          },
          body: JSON.stringify(payload),
        });

      let response = await attemptJsonUpdate("PUT", `${API_BASE}/posts/${id}`);
      if (response.status === 405)
        response = await attemptJsonUpdate("PATCH", `${API_BASE}/posts/${id}`);
      if (response.status === 405)
        response = await attemptJsonUpdate(
          "POST",
          `${API_BASE}/posts/${id}?_method=PUT`
        );
      if (response.status === 405)
        response = await attemptJsonUpdate("POST", `${API_BASE}/posts/${id}`, {
          "X-HTTP-Method-Override": "PUT",
        });

      if (!response.ok) {
        let errMsg = `Failed to update post (status ${response.status})`;
        try {
          const body = await response.json();
          if (body?.error) errMsg = body.error;
          else if (body?.message) errMsg = body.message;
          else errMsg = JSON.stringify(body);
        } catch (e) {
          const text = await response.text().catch(() => "");
          if (text) errMsg = text;
        }
        setError(errMsg);
        throw new Error(errMsg);
      }

      console.log("✅ Post updated successfully!");
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error("❌ Error saving post:", err);
      alert(`Error saving post: ${err.message}`);
    }
  };

  // Unused comment handler (prefixed with _)
  const _handleCommentSubmit = async (commentText) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("You must be logged in to comment.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ content: commentText, user_id: user.id }),
      });
      if (!res.ok)
        throw new Error((await res.text()) || "Failed to post comment");
    } catch (err) {
      setError(err.message);
      console.error("❌ Error posting comment:", err);
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

          <label htmlFor="excerpt">Excerpt / Summary</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary for previews (required)"
            rows={3}
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
                setFeaturedImage(URL.createObjectURL(file));
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

            <div className="formatting-toggle">
              <input
                type="checkbox"
                id="markdownToggle"
                checked={useMarkdown}
                onChange={() => setUseMarkdown(!useMarkdown)}
              />
              <label htmlFor="markdownToggle">Use Markdown</label>
            </div>
          </div>
        </form>

        {showPreview && (
          <div className="edit-post-preview">
            <h2 className="preview-title">{title || "Untitled Post"}</h2>
            {featuredImage && (
              <div className="preview-featured">
                <img
                  src={
                    featuredImageFile
                      ? featuredImage
                      : featuredImage.startsWith("http")
                      ? featuredImage
                      : `${API_BASE}${featuredImage}`
                  }
                  alt={title || "Featured"}
                  className="preview-image"
                />
              </div>
            )}
            <div className="preview-content">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                "Start typing to see preview..."
              )}
            </div>
            <button type="button" className="save-button" onClick={handleSave}>
              Save Changes
            </button>

            {relatedPosts.length > 0 && (
              <aside className="edit-post-related">
                <h3>Related Posts</h3>
                {relatedPosts.map((rp) => (
                  <div key={rp.id} className="edit-post-related-item">
                    <a
                      href={`/posts/${rp.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {rp.title}
                    </a>
                  </div>
                ))}
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPost;
