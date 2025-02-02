import React, { useState, useEffect } from "react";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    // Fetching posts
    fetch("http://127.0.0.1:5555/posts")
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error(error));

    // Fetching users for dropdown
    fetch("http://127.0.0.1:5555/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error(error));
  }, []);

  const handleCommentSubmit = (postId) => {
    if (!selectedUser || !comment) {
      alert("Please select a user and write a comment.");
      return;
    }

    fetch(`http://127.0.0.1:5555/posts/${postId}/comments`, {
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
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
  };

  const getOwnerUsername = (ownerId) => {
    const owner = users.find((user) => user.id === ownerId);
    return owner ? owner.username : "Unknown Owner";
  };

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>
            <strong>Owner:</strong> {getOwnerUsername(post.user_id)}
          </p>

          <div className="comment-section">
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

            <button onClick={() => handleCommentSubmit(post.id)}>
              Add Comment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
