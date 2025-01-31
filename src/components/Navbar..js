import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Home</Link> |<Link to="/register">Register</Link> |
      <Link to="/login">Login</Link> |<Link to="/dashboard">Dashboard</Link> |
      <Link to="/create-post">Create Post</Link> |
      <Link to="/authors">Authors</Link>
    </nav>
  );
};

export default Navbar;
