import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ViewPost = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [comment, setComment] = useState("");
  const [users, setUsers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    // Fetch the post by ID
    fetch(`http://localhost:5555/posts/${id}`)
      .then((response) => response.json())
      .then((data) => setPost(data))
      .catch((error) => console.error(error));

    // Fetch comments for this post
    fetch(`http://localhost:5555/posts/${id}/comments`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error(error));

    // Fetch users for dropdown
    fetch("http://localhost:5555/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error(error));
  }, [id]); // Re-fetch whenever the postId changes

  const handleCommentSubmit = () => {
    if (!selectedUser || !comment) {
      alert("Please select a user and write a comment.");
      return;
    }

    fetch(`http://localhost:5555/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: selectedUser,
        content: comment,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Comment added:", data);
        setComment(""); // Clear the textarea
        setComments((prevComments) => [...prevComments, data]); // Update comments list
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
  };

  // Function to get the username for each comment's userId
  const getUserUsername = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
  };

  return (
    <div>
      {post ? (
        <div>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <h3>Comments</h3>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{getUserUsername(comment.user_id)}</strong>:{" "}
                {comment.content}
              </li>
            ))}
          </ul>

          {/* Comment Form */}
          <h4>Add a Comment</h4>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <button onClick={handleCommentSubmit}>Submit Comment</button>
        </div>
      ) : (
        <p>Loading post...</p>
      )}
    </div>
  );
};

export default ViewPost;
