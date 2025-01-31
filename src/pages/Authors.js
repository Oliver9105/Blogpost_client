import React, { useEffect, useState } from "react";

const Authors = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch("http://localhost:5555/api/authors");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch authors");
        }

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
        <div key={author.id}>
          <h2>{author.username}</h2>
          <p>{author.email}</p>
        </div>
      ))}
    </div>
  );
};

export default Authors;
