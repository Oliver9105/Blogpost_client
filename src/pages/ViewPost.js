import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../ViewPost.css";

const ViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch post data
        const postRes = await fetch(
          `https://blogpost-app-br7f.onrender.com/posts/${id}`
        );

        if (!postRes.ok) {
          if (postRes.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error("Failed to fetch post");
        }

        const postData = await postRes.json();
        setPost(postData);

        // Fetch comments
        try {
          const commentsRes = await fetch(
            `https://blogpost-app-br7f.onrender.com/posts/${id}/comments`
          );

          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            setComments(commentsData);
          }
        } catch (commentsError) {
          console.warn("Could not fetch comments:", commentsError.message);
        }

        // Fetch related posts
        try {
          const relatedRes = await fetch(
            `https://blogpost-app-br7f.onrender.com/posts/related/${id}`
          );

          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedPosts(relatedData);
          } else {
            // Fallback to general posts if related endpoint fails
            const postsRes = await fetch(
              "https://blogpost-app-br7f.onrender.com/posts"
            );

            if (postsRes.ok) {
              const postsData = await postsRes.json();
              // Filter out current post and take up to 3 posts
              const filteredPosts = postsData
                .filter((p) => p.id !== parseInt(id))
                .slice(0, 3);
              setRelatedPosts(filteredPosts);
            }
          }
        } catch (relatedError) {
          console.warn("Could not fetch related posts:", relatedError.message);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setNotification({
        message: `Searching for: ${searchQuery}`,
        type: "info",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setNotification({
        message: "Please write a comment",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
      return;
    }

    // Create a temporary comment object for immediate UI update
    const tempComment = {
      id: Date.now(),
      content: newComment,
      date: new Date().toISOString(),
      user: "You", // In a real app, this would come from authentication
      replies: [],
    };

    // Optimistically update the UI
    setComments([...comments, tempComment]);

    // Make the API request - try different request body formats
    const requestBody = {
      content: newComment,
      user: "You", // Add user field
    };

    fetch(`https://blogpost-app-br7f.onrender.com/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          // Try to get more details about the error
          return response.text().then((text) => {
            throw new Error(`Server error: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        // Replace the temporary comment with the actual one from the server
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === tempComment.id ? data : comment
          )
        );
        setNotification({
          message: "Comment posted successfully!",
          type: "success",
        });
      })
      .catch((error) => {
        // Revert the optimistic update on error
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== tempComment.id)
        );
        setNotification({
          message: "Error posting comment. Please try again.",
          type: "error",
        });
        console.error("Error adding comment:", error.message);
      })
      .finally(() => {
        setNewComment("");
        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
      });
  };

  const handleReplySubmit = (commentId, e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      setNotification({ message: "Please write a reply", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
      return;
    }

    const newReply = {
      id: Date.now(),
      user: "You",
      date: new Date().toISOString(),
      content: replyContent,
    };

    const updatedComments = comments.map((comment) =>
      comment.id === commentId
        ? { ...comment, replies: [...(comment.replies || []), newReply] }
        : comment
    );

    setComments(updatedComments);
    setReplyContent("");
    setReplyingTo(null);
    setNotification({ message: "Reply posted successfully!", type: "success" });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title,
          text: post?.content?.substring(0, 100) + "...",
          url: window.location.href,
        })
        .then(() =>
          setNotification({ message: "Thanks for sharing!", type: "success" })
        )
        .catch(() =>
          setNotification({ message: "Error sharing content", type: "error" })
        );
    } else {
      setNotification({ message: "Web Share API not supported", type: "info" });
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setNotification({ message: "Please enter a valid email", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
      return;
    }

    setNotification({
      message: `Subscribed with email: ${email}`,
      type: "success",
    });
    setEmail("");
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleWritePost = () => {
    navigate("/create");
  };

  const handleEditPost = () => {
    navigate(`/edit/${id}`);
  };

  if (loading) return <div className="view-post loading">Loading post...</div>;
  if (error) return <div className="view-post error">Error: {error}</div>;
  if (!post) return <div className="view-post error">Post not found</div>;

  return (
    <div className="view-post">
      {notification.message && (
        <div className={`view-post notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="view-post-header">
        <div className="view-post nav-container">
          <Link to="/" className="view-post logo">
            BlogHub
          </Link>
          <div className="view-post nav-links">
            <Link to="/">Home</Link>
            <button
              className="view-post write-post-button"
              onClick={handleWritePost}
            >
              Write Post
            </button>
          </div>
          <form className="view-post search-bar" onSubmit={handleSearch}>
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

      <div className="view-post container">
        <main>
          <article>
            <div className="view-post article-header">
              <h1 className="view-post article-title">{post.title}</h1>
              <div className="view-post article-meta">
                <div className="view-post user">
                  <div className="view-post user-avatar">
                    {post.user?.charAt(0) || "U"}
                  </div>
                  <span className="view-post user-name">
                    {post.user || "Unknown User"}
                  </span>
                </div>
                <div className="view-post publish-date">
                  <i className="far fa-calendar-alt"></i>
                  <span>
                    {new Date(post.date || Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="view-post tag">
                  <i className="fas fa-tag"></i>
                  <span>{post.category || "Uncategorized"}</span>
                </div>
                <div className="view-post share-button" onClick={handleShare}>
                  <i className="fas fa-share-alt"></i>
                  <span>{post.shares || 128}</span>
                </div>
                <button
                  className="view-post edit-post-button"
                  onClick={handleEditPost}
                >
                  Edit Post
                </button>
              </div>
            </div>

            <div className="view-post article-content">
              {post.content ? (
                <p>{post.content}</p>
              ) : (
                <p>No content available for this post.</p>
              )}
            </div>
          </article>

          <div className="view-post comments-section">
            <h3 className="view-post comments-title">
              Comments ({comments.length})
            </h3>

            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="view-post comment">
                  <div className="view-post comment-header">
                    <div className="view-post comment-user-info">
                      <div className="view-post comment-user-avatar">
                        {comment.user?.charAt(0) || "A"}
                      </div>
                      <span className="view-post comment-user">
                        {comment.user || "Anonymous User"}
                      </span>
                    </div>
                    <span className="view-post comment-time">
                      {comment.date &&
                        new Date(comment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </span>
                  </div>
                  <p className="view-post comment-content">{comment.content}</p>
                  <button
                    className="view-post comment-reply"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                  >
                    <i className="fas fa-reply"></i> Reply
                  </button>

                  {replyingTo === comment.id && (
                    <div className="view-post reply-form">
                      <textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="view-post reply-actions">
                        <button
                          onClick={(e) => handleReplySubmit(comment.id, e)}
                        >
                          Post Reply
                        </button>
                        <button
                          className="view-post cancel-reply"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {comment.replies?.map((reply) => (
                    <div key={reply.id} className="view-post comment reply">
                      <div className="view-post comment-header">
                        <div className="view-post comment-user-info">
                          <div className="view-post comment-user-avatar">
                            {reply.user?.charAt(0) || "A"}
                          </div>
                          <span className="view-post comment-user">
                            {reply.user || "Anonymous User"}
                          </span>
                        </div>
                        <span className="view-post comment-time">
                          {reply.date &&
                            new Date(reply.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                        </span>
                      </div>
                      <p className="view-post comment-content">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="view-post no-comments">
                No comments yet. Be the first to comment!
              </p>
            )}

            <form
              className="view-post add-comment"
              onSubmit={handleCommentSubmit}
            >
              <h4>Add a comment</h4>

              <textarea
                placeholder="Write your thoughts here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>

              <button
                type="submit"
                className="view-post submit-comment"
                disabled={!newComment.trim()}
              >
                Post Comment
              </button>
            </form>
          </div>
        </main>

        <aside>
          <div className="view-post sidebar-widget">
            <h3 className="view-post widget-title">In this article</h3>
            <ul className="view-post toc-list">
              <li>
                <a href="#principles">The Core Principles</a>
              </li>
              <li>
                <a href="#performance">The Role of Performance</a>
              </li>
            </ul>
          </div>

          {relatedPosts.length > 0 && (
            <div className="view-post sidebar-widget">
              <h3 className="view-post widget-title">Related Posts</h3>
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="view-post related-post">
                  <div className="view-post related-post-content">
                    <div className="view-post related-post-category">
                      {relatedPost.category || "General"}
                    </div>
                    <h4 className="view-post related-post-title">
                      {relatedPost.title || "Untitled Post"}
                    </h4>
                    <p className="view-post related-post-user">
                      By {relatedPost.user || "Unknown User"}
                    </p>
                    <p className="view-post related-post-excerpt">
                      {relatedPost.excerpt ||
                        relatedPost.content?.substring(0, 100) + "..." ||
                        "No excerpt available."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form className="view-post sidebar-widget" onSubmit={handleSubscribe}>
            <h3 className="view-post widget-title">Subscribe</h3>
            <p className="view-post subscribe-text">
              Get the latest posts delivered right to your inbox
            </p>
            <div className="view-post subscribe-form">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Subscribe</button>
            </div>
          </form>
        </aside>
      </div>

      <footer className="view-post-footer">
        <div className="view-post footer-content">
          <p>© 2025 BlogHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ViewPost;
