import React, { useEffect, useState } from "react";
import Author from "../components/Author";

const Authors = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch("http://localhost:5555/authors");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch authors");
        setAuthors(data.authors);
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };
    fetchAuthors();
  }, []);

  return (
    <div>
      <h1>Authors</h1>
      {authors.map((author) => (
        <Author
          key={author.id}
          username={author.username}
          email={author.email}
        />
      ))}
    </div>
  );
};

export default Authors;
