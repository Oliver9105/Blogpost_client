import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";

function App() {
  return (
    <div className="App">
      <Navbar /> {/* Display Navbar on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/createpost" element={<CreatePost />} />
      </Routes>
    </div>
  );
}

export default App;
