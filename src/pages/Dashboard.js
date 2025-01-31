import React, { useEffect, useState } from "react";
import Post from "../components/Post";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5555/api/dashboard");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch posts");
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {posts.map((post) => (
        <Post key={post.id} title={post.title} content={post.content} />
      ))}
    </div>
  );
};

export default Dashboard;
