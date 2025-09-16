import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../ViewPost.css";

const API_BASE_URL = "http://localhost:5555";

const ViewPost = ({ isAuthenticated, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/posts/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Post not found");
          throw new Error("Failed to fetch post");
        }
        const data = await res.json();

        if (!data.published) {
          const authorId = data.author?.id || data.author_id;
          if (!isAuthenticated || user?.id !== authorId) {
            throw new Error("You are not authorized to view this post");
          }
        }

        setPost(data);

        const commentsRes = await fetch(`${API_BASE_URL}/posts/${id}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }

        const relatedRes = await fetch(`${API_BASE_URL}/posts/${id}/related`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedPosts(relatedData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isAuthenticated, user]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = {
      id: Date.now(),
      content: newComment,
      created_at: new Date().toISOString(),
      author: { username: "You" },
      replies: [],
    };

    setComments([...comments, tempComment]);
    setNewComment("");

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          author_id: user?.id || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const savedComment = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === tempComment.id ? savedComment : c))
      );
    } catch (err) {
      setNotification({ message: "Error posting comment", type: "error" });
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    }
  };

  const handleReplySubmit = (commentId, e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const newReply = {
      id: Date.now(),
      author: { username: "You" },
      content: replyContent,
      created_at: new Date().toISOString(),
    };

    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    );
    setReplyContent("");
    setReplyingTo(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content?.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      alert("Web Share API not supported");
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    alert(`Subscribed with email: ${email}`);
    setEmail("");
  };

  const handleEditPost = () => {
    if (!isAuthenticated || user.id !== (post.author?.id || post.author_id)) {
      alert("You cannot edit this post");
      return;
    }
    navigate(`/edit/${id}`);
  };

  if (loading) return <div className="view-post-loading">Loading post...</div>;
  if (error) return <div className="view-post-error">{error}</div>;

  const postCategory = post.category?.name || post.category || "Uncategorized";
  const postAuthor =
    post.owner?.username || post.author?.username || post.author || "Unknown";
  const postTags = post.tags || [];
  const postCommentsCount = comments.length;

  return (
    <div className="view-post">
      {notification.message && (
        <div className={`view-post-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="view-post-container">
        <main>
          <header className="view-post-article-header">
            <h1 className="view-post-article-title">{post.title}</h1>
            <div className="view-post-article-meta">
              <span className="view-post-user">
                By <span className="view-post-user-name">{postAuthor}</span>
              </span>
              <span className="view-post-publish-date">
                {post.created_at &&
                  new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="view-post-tag">{postCategory}</span>
              <span className="view-post-comment-count">
                {postCommentsCount} comments
              </span>
              <button
                className="view-post-share-button"
                onClick={handleShare}
                type="button"
              >
                Share
              </button>
              {isAuthenticated &&
                user.id === (post.author?.id || post.author_id) && (
                  <button
                    className="view-post-edit-button"
                    onClick={handleEditPost}
                    type="button"
                  >
                    Edit Post
                  </button>
                )}
            </div>
          </header>

          {post.featured_image && (
            <div className="view-post-featured-image">
              <img
                src={
                  post.featured_image.startsWith("http")
                    ? post.featured_image
                    : `http://localhost:5555${post.featured_image}`
                }
                alt={post.title}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {postTags.length > 0 && (
            <div
              className="view-post-article-meta"
              style={{ marginBottom: 20 }}
            >
              {postTags.map((tag) => (
                <span key={tag.id} className="view-post-tag">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="view-post-article-content">
            <p>{post.excerpt}</p>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <section className="view-post-comments-section">
            <h2 className="view-post-comments-title">
              Comments ({postCommentsCount})
            </h2>
            {postCommentsCount === 0 && (
              <div className="view-post-no-comments">No comments yet.</div>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="view-post-comment">
                <div className="view-post-comment-header">
                  <div className="view-post-comment-user-info">
                    <span className="view-post-comment-user">
                      {comment.author?.username || "Anonymous"}
                    </span>
                    <span className="view-post-comment-time">
                      {comment.created_at &&
                        new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="view-post-comment-reply"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                  >
                    Reply
                  </button>
                </div>
                <div className="view-post-comment-content">
                  {comment.content}
                </div>
                {replyingTo === comment.id && (
                  <form
                    className="view-post-reply-form"
                    onSubmit={(e) => handleReplySubmit(comment.id, e)}
                  >
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                    />
                    <div className="view-post-reply-actions">
                      <button type="submit">Post Reply</button>
                      <button
                        type="button"
                        className="view-post-cancel-reply"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {comment.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className="view-post-comment view-post-comment-reply"
                  >
                    <div className="view-post-comment-header">
                      <div className="view-post-comment-user-info">
                        <span className="view-post-comment-user">
                          {reply.author?.username || "Anonymous"}
                        </span>
                        <span className="view-post-comment-time">
                          {reply.created_at &&
                            new Date(reply.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="view-post-comment-content">
                      {reply.content}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <form
              className="view-post-add-comment"
              onSubmit={handleCommentSubmit}
            >
              <h4>Add a Comment</h4>
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="view-post-submit-comment"
                type="submit"
                disabled={!newComment.trim()}
              >
                Post Comment
              </button>
            </form>
          </section>
        </main>
        <aside>
          <div className="view-post-sidebar-widget">
            <h3 className="view-post-widget-title">Related Posts</h3>
            {relatedPosts.map((rp) => (
              <div
                key={rp.id}
                className="view-post-related-post"
                onClick={() => navigate(`/posts/${rp.id}`)}
                style={{ cursor: "pointer" }}
              >
                {rp.featured_image && (
                  <div className="view-post-related-image">
                    <img
                      src={
                        rp.featured_image.startsWith("http")
                          ? rp.featured_image
                          : `http://localhost:5555${rp.featured_image}`
                      }
                      alt={rp.title}
                    />
                  </div>
                )}
                <div className="view-post-related-post-category">
                  {rp.category?.name || rp.category || "Uncategorized"}
                </div>
                <div className="view-post-related-post-title">{rp.title}</div>
                <div className="view-post-related-post-user">
                  By {rp.owner?.username || rp.author?.username || "Unknown"}
                </div>
                <div className="view-post-related-post-excerpt">
                  {rp.excerpt}
                </div>
              </div>
            ))}
          </div>
          <div className="view-post-sidebar-widget">
            <h3 className="view-post-widget-title">Subscribe</h3>
            <div className="view-post-subscribe-text">
              Get updates on new posts and discussions.
            </div>
            <form
              className="view-post-subscribe-form"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>
      <footer className="view-post-footer">
        <div className="view-post-footer-content">
          © 2025 BlogHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ViewPost;
