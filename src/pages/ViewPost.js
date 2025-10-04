import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../ViewPost.css";

const API_BASE_URL = "http://localhost:5555";

const ViewPost = ({ isAuthenticated, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main state - SEPARATE comments and replies
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]); // Separate state for replies
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment states
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  // UI states
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [imageErrors, setImageErrors] = useState(new Set());

  // Memoized computed values
  const postCategory = useMemo(
    () => post?.category?.name || post?.category || "Uncategorized",
    [post]
  );

  const postAuthor = useMemo(
    () =>
      post?.owner?.username ||
      post?.author?.username ||
      post?.author ||
      "Unknown",
    [post]
  );

  const postTags = useMemo(() => post?.tags || [], [post]);

  // Check if current user is the owner of this post
  const isPostOwner = useMemo(() => {
    if (!isAuthenticated) return false;
    if (!user || !user.id) return false;
    if (!post) return false;

    const authorId = post.author?.id || post.author_id || post.owner?.id;
    if (!authorId) return false;

    return String(user.id) === String(authorId);
  }, [isAuthenticated, user, post]);

  // Only show edit button if user owns the post
  const canEditPost = useMemo(() => {
    return isPostOwner && post?.id;
  }, [isPostOwner, post]);

  // Get replies for a specific comment
  const getRepliesForComment = useCallback(
    (commentId) => {
      return replies.filter((reply) => reply.comment_id === commentId);
    },
    [replies]
  );

  // Check if comment has replies
  const hasReplies = useCallback(
    (commentId) => {
      return getRepliesForComment(commentId).length > 0;
    },
    [getRepliesForComment]
  );

  // Get reply count for a comment
  const getReplyCount = useCallback(
    (commentId) => {
      return getRepliesForComment(commentId).length;
    },
    [getRepliesForComment]
  );

  // Check if replies are expanded for a comment
  const areRepliesExpanded = useCallback(
    (commentId) => {
      return expandedReplies.has(commentId);
    },
    [expandedReplies]
  );

  // Show notification helper
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  }, []);

  // Image error handler
  const handleImageError = useCallback((imageSrc) => {
    setImageErrors((prev) => new Set([...prev, imageSrc]));
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const commentsRes = await fetch(`${API_BASE_URL}/posts/${id}/comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(Array.isArray(commentsData) ? commentsData : []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [id]);

  // REMOVED: fetchReplies function since it was unused

  // Fetch all replies for the post
  const fetchAllReplies = useCallback(async () => {
    try {
      // Since replies don't have post_id anymore, we need to fetch via comments
      // First get all comments for this post, then get replies for each comment
      const commentsRes = await fetch(`${API_BASE_URL}/posts/${id}/comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        const allReplies = [];

        // Get replies for each comment
        for (const comment of commentsData) {
          const repliesRes = await fetch(
            `${API_BASE_URL}/replies?comment_id=${comment.id}`
          );
          if (repliesRes.ok) {
            const repliesData = await repliesRes.json();
            allReplies.push(...repliesData);
          }
        }

        setReplies(allReplies);
      }
    } catch (err) {
      console.error("Error fetching all replies:", err);
    }
  }, [id]);

  // Fetch related posts
  const fetchRelatedPosts = useCallback(async () => {
    try {
      const relatedRes = await fetch(`${API_BASE_URL}/posts/${id}/related`);
      if (relatedRes.ok) {
        const relatedData = await relatedRes.json();
        setRelatedPosts(Array.isArray(relatedData) ? relatedData : []);
      }
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  }, [id]);

  // Fetch post data
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/posts/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Post not found");
        }
        if (res.status === 403) {
          throw new Error("You are not authorized to view this post");
        }
        throw new Error(`Failed to fetch post (${res.status})`);
      }

      const data = await res.json();

      // Check authorization for unpublished posts
      if (!data.published) {
        const authorId = data.author?.id || data.author_id;
        if (!isAuthenticated || user?.id !== authorId) {
          throw new Error("You are not authorized to view this post");
        }
      }

      setPost(data);

      // Fetch comments first, then replies and related posts
      await fetchComments();
      await Promise.allSettled([fetchAllReplies(), fetchRelatedPosts()]);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    id,
    isAuthenticated,
    user,
    fetchComments,
    fetchAllReplies,
    fetchRelatedPosts,
  ]);

  // Handle comment submission
  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newComment.trim()) {
        showNotification("Comment cannot be empty", "error");
        return;
      }

      if (!isAuthenticated) {
        showNotification("Please log in to comment", "error");
        return;
      }

      const tempId = Date.now();
      const tempComment = {
        id: tempId,
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        author: { username: user?.username || "You" },
      };

      // Optimistic update
      setComments((prevComments) => [...prevComments, tempComment]);
      setNewComment("");
      setCommentLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/posts/${id}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user?.token && { Authorization: `Bearer ${user.token}` }),
          },
          body: JSON.stringify({
            content: newComment.trim(),
            user_id: user?.id || 0,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to post comment (${res.status})`);
        }

        const savedComment = await res.json();

        // Replace temp comment with saved comment
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === tempId ? savedComment : c))
        );

        showNotification("Comment posted successfully!");
      } catch (err) {
        console.error("Error posting comment:", err);
        showNotification("Failed to post comment. Please try again.", "error");

        // Remove temp comment on error
        setComments((prevComments) =>
          prevComments.filter((c) => c.id !== tempId)
        );
      } finally {
        setCommentLoading(false);
      }
    },
    [newComment, isAuthenticated, user, id, showNotification]
  );

  // Handle reply submission
  const handleReplySubmit = useCallback(
    async (commentId, e) => {
      e.preventDefault();

      if (!replyContent.trim()) {
        showNotification("Reply cannot be empty", "error");
        return;
      }

      if (!isAuthenticated) {
        showNotification("Please log in to reply", "error");
        return;
      }

      const tempId = Date.now();
      const newReply = {
        id: tempId,
        author: { username: user?.username || "You" },
        content: replyContent.trim(),
        created_at: new Date().toISOString(),
        comment_id: commentId,
      };

      // Optimistic update - add to separate replies state
      setReplies((prevReplies) => [...prevReplies, newReply]);
      setReplyContent("");
      setReplyingTo(null);
      setReplyLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/replies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user?.token && { Authorization: `Bearer ${user.token}` }),
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            user_id: user?.id || 0,
            comment_id: commentId,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to post reply (${res.status})`);
        }

        const savedReply = await res.json();

        // Replace temp reply with saved reply
        setReplies((prevReplies) =>
          prevReplies.map((reply) => (reply.id === tempId ? savedReply : reply))
        );

        // Automatically expand replies to show the new reply
        setExpandedReplies((prev) => new Set([...prev, commentId]));

        showNotification("Reply posted successfully!");
      } catch (err) {
        console.error("Error posting reply:", err);
        showNotification("Failed to post reply. Please try again.", "error");

        // Remove temp reply on error
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.id !== tempId)
        );
      } finally {
        setReplyLoading(false);
      }
    },
    [replyContent, isAuthenticated, user, showNotification]
  );

  // Handle subscription
  const handleSubscribe = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email.trim()) {
        showNotification("Please enter your email", "error");
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        showNotification("Please enter a valid email address", "error");
        return;
      }

      setEmailLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        if (res.ok) {
          showNotification(`Successfully subscribed with ${email}!`);
          setEmail("");
        } else {
          throw new Error("Subscription failed");
        }
      } catch (err) {
        console.error("Error subscribing:", err);
        showNotification("Failed to subscribe. Please try again.", "error");
      } finally {
        setEmailLoading(false);
      }
    },
    [email, showNotification]
  );

  // Handle edit post
  const handleEditPost = useCallback(() => {
    if (!isAuthenticated) {
      showNotification("Please log in to edit posts", "error");
      return;
    }

    if (!canEditPost) {
      showNotification("You can only edit your own posts", "error");
      return;
    }

    if (!post?.id) {
      showNotification("Post not found", "error");
      return;
    }

    navigate(`/edit/${id}`);
  }, [isAuthenticated, canEditPost, post, navigate, id, showNotification]);

  // Handle related post navigation
  const handleRelatedPostClick = useCallback(
    (postId) => {
      navigate(`/posts/${postId}`);
    },
    [navigate]
  );

  // Toggle reply form
  const toggleReplyForm = useCallback((commentId) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
    setReplyContent(""); // Clear content when toggling
  }, []);

  // Toggle reply visibility
  const toggleRepliesVisibility = useCallback((commentId) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return "";
    }
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      return "";
    }
  }, []);

  // Get image source helper
  const getImageSrc = useCallback((imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  }, []);

  // Keyboard event handlers for accessibility
  const handleKeyDown = useCallback((e, callback) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id, fetchPost]);

  // Clear notification when component unmounts
  useEffect(() => {
    return () => {
      setNotification({ message: "", type: "" });
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="view-post-loading" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        Loading post...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="view-post-error" role="alert" aria-live="assertive">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchPost} className="retry-button" disabled={loading}>
          {loading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  // No post found
  if (!post) {
    return (
      <div className="view-post-error" role="alert">
        <h2>Post Not Found</h2>
        <p>The requested post could not be found.</p>
      </div>
    );
  }

  const postCommentsCount = comments.length;

  return (
    <div className="view-post">
      {/* Notification Bar */}
      {notification.message && (
        <div
          className={`view-post-notification ${notification.type}`}
          role="alert"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      <div className="view-post-container">
        <main>
          {/* Article Header */}
          <header className="view-post-article-header">
            <h1 className="view-post-article-title">{post.title}</h1>
            <div className="view-post-article-meta">
              <span className="view-post-user">
                By <span className="view-post-user-name">{postAuthor}</span>
              </span>
              <time
                className="view-post-publish-date"
                dateTime={post.created_at}
              >
                {formatDate(post.created_at)}
              </time>
              <span className="view-post-tag">{postCategory}</span>
              <span className="view-post-comment-count">
                {postCommentsCount}{" "}
                {postCommentsCount === 1 ? "comment" : "comments"}
              </span>

              {/* Edit button - only visible to post owner */}
              {isAuthenticated && canEditPost && (
                <button
                  className="view-post-edit-button"
                  onClick={handleEditPost}
                  type="button"
                  aria-label={`Edit post: ${post.title}`}
                  data-testid="edit-post-button"
                >
                  Edit
                </button>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && !imageErrors.has(post.featured_image) && (
            <div className="view-post-featured-image">
              <img
                src={getImageSrc(post.featured_image)}
                alt={post.title}
                onError={() => handleImageError(post.featured_image)}
                loading="lazy"
              />
            </div>
          )}

          {/* Tags */}
          {postTags.length > 0 && (
            <div
              className="view-post-article-meta"
              style={{ marginBottom: 20 }}
            >
              {postTags.map((tag) => (
                <span key={tag.id || tag.name} className="view-post-tag">
                  #{tag.name || tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Content */}
          <div className="view-post-article-content">
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            <div className="post-content">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>

          {/* Comments Section */}
          <section className="view-post-comments-section">
            <h2 className="view-post-comments-title">
              Comments ({postCommentsCount})
            </h2>

            {postCommentsCount === 0 ? (
              <div className="view-post-no-comments">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="comments-list">
                {comments.map((comment) => {
                  const commentReplies = getRepliesForComment(comment.id);
                  const replyCount = getReplyCount(comment.id);
                  const hasCommentReplies = hasReplies(comment.id);
                  const isExpanded = areRepliesExpanded(comment.id);

                  return (
                    <article key={comment.id} className="view-post-comment">
                      <div className="view-post-comment-header">
                        <div className="view-post-comment-user-info">
                          <span className="view-post-comment-user">
                            {comment.author?.username || "Anonymous"}
                          </span>
                          <time
                            className="view-post-comment-time"
                            dateTime={comment.created_at}
                          >
                            {formatDateTime(comment.created_at)}
                          </time>
                        </div>
                        <div className="view-post-comment-actions">
                          <button
                            className="view-post-comment-reply-btn"
                            onClick={() => toggleReplyForm(comment.id)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, () =>
                                toggleReplyForm(comment.id)
                              )
                            }
                            aria-expanded={replyingTo === comment.id}
                            aria-label="Reply to this comment"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                      <div className="view-post-comment-content">
                        {comment.content}
                      </div>

                      {/* Reply count and toggle - only show if comment has replies */}
                      {hasCommentReplies && (
                        <div className="view-post-comment-reply-toggle">
                          <button
                            className={`view-post-replies-toggle ${
                              isExpanded ? "expanded" : "collapsed"
                            }`}
                            onClick={() => toggleRepliesVisibility(comment.id)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, () =>
                                toggleRepliesVisibility(comment.id)
                              )
                            }
                            aria-expanded={isExpanded}
                            aria-label={`${
                              isExpanded ? "Hide" : "Show"
                            } ${replyCount} ${
                              replyCount === 1 ? "reply" : "replies"
                            }`}
                          >
                            <span className="reply-toggle-icon">
                              {isExpanded ? "▼" : "▶"}
                            </span>
                            <span className="reply-count-text">
                              {replyCount}{" "}
                              {replyCount === 1 ? "reply" : "replies"}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <form
                          className="view-post-reply-form"
                          onSubmit={(e) => handleReplySubmit(comment.id, e)}
                        >
                          <label
                            htmlFor={`reply-${comment.id}`}
                            className="sr-only"
                          >
                            Write a reply to{" "}
                            {comment.author?.username || "this comment"}
                          </label>
                          <textarea
                            id={`reply-${comment.id}`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            rows="3"
                            required
                            aria-required="true"
                          />
                          <div className="view-post-reply-actions">
                            <button
                              type="submit"
                              disabled={!replyContent.trim() || replyLoading}
                            >
                              {replyLoading ? "Posting..." : "Post Reply"}
                            </button>
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

                      {/* Replies - only show if expanded */}
                      {hasCommentReplies && isExpanded && (
                        <div className="replies-list">
                          {commentReplies.map((reply) => (
                            <article
                              key={reply.id}
                              className="view-post-comment view-post-comment-reply"
                            >
                              <div className="view-post-comment-header">
                                <div className="view-post-comment-user-info">
                                  <span className="view-post-comment-user">
                                    {reply.author?.username || "Anonymous"}
                                  </span>
                                  <time
                                    className="view-post-comment-time"
                                    dateTime={reply.created_at}
                                  >
                                    {formatDateTime(reply.created_at)}
                                  </time>
                                </div>
                              </div>
                              <div className="view-post-comment-content">
                                {reply.content}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {/* Add Comment Form */}
            <form
              className="view-post-add-comment"
              onSubmit={handleCommentSubmit}
            >
              <h3>Add a Comment</h3>
              {!isAuthenticated && (
                <p className="login-prompt">
                  Please <a href="/login">log in</a> to post a comment.
                </p>
              )}
              <label htmlFor="new-comment" className="sr-only">
                Write your comment
              </label>
              <textarea
                id="new-comment"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isAuthenticated}
                rows="4"
                aria-required="true"
                required
              />
              <button
                className="view-post-submit-comment"
                type="submit"
                disabled={
                  !newComment.trim() || !isAuthenticated || commentLoading
                }
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>
          </section>
        </main>

        {/* Sidebar */}
        <aside>
          {/* Related Posts Widget */}
          <div className="view-post-sidebar-widget">
            <h3 className="view-post-widget-title">Related Posts</h3>
            {relatedPosts.length === 0 ? (
              <p className="no-related-posts">No related posts found.</p>
            ) : (
              <div className="related-posts-list">
                {relatedPosts.map((rp) => (
                  <article
                    key={rp.id}
                    className="view-post-related-post"
                    onClick={() => handleRelatedPostClick(rp.id)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, () => handleRelatedPostClick(rp.id))
                    }
                    tabIndex="0"
                    role="button"
                    aria-label={`Read post: ${rp.title}`}
                  >
                    {rp.featured_image &&
                      !imageErrors.has(rp.featured_image) && (
                        <div className="view-post-related-image">
                          <img
                            src={getImageSrc(rp.featured_image)}
                            alt={rp.title}
                            onError={() => handleImageError(rp.featured_image)}
                            loading="lazy"
                          />
                        </div>
                      )}
                    <div className="view-post-related-post-category">
                      {rp.category?.name || rp.category || "Uncategorized"}
                    </div>
                    <h4 className="view-post-related-post-title">{rp.title}</h4>
                    <div className="view-post-related-post-user">
                      By{" "}
                      {rp.owner?.username || rp.author?.username || "Unknown"}
                    </div>
                    {rp.excerpt && (
                      <div className="view-post-related-post-excerpt">
                        {rp.excerpt}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Subscribe Widget */}
          <div className="view-post-sidebar-widget">
            <h3 className="view-post-widget-title">Subscribe</h3>
            <p className="view-post-subscribe-text">
              Get updates on new posts and discussions.
            </p>
            <form
              className="view-post-subscribe-form"
              onSubmit={handleSubscribe}
            >
              <label htmlFor="subscribe-email" className="sr-only">
                Enter your email address
              </label>
              <input
                id="subscribe-email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailLoading}
                required
                aria-required="true"
              />
              <button type="submit" disabled={!email.trim() || emailLoading}>
                {emailLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="view-post-footer">
        <div className="view-post-footer-content">
          © 2025 BlogHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ViewPost;
