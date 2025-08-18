import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetching posts
    fetch("https://blogpost-app-qx9s.onrender.com/posts")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched posts:", data);
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <p>{post.content}</p>

          <div className="comment-section">
            <Link to={`/posts/${post.id}`}>View Post</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
