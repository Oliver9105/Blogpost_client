import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import ViewPost from "./pages/ViewPost";
import EditPost from "./pages/EditPost";
import SignIn from "./pages/SignIn";
import Navigation from "./components/Navigation";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/signin" />;
  };

  return (
    <div className="App">
      <Navigation
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Register onLogin={login} />
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePost user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/posts/:id" element={<ViewPost />} />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signin"
          element={
            isAuthenticated ? <Navigate to="/" /> : <SignIn onLogin={login} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
