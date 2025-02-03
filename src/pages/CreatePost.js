import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const CreatePost = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch all users to populate the dropdown
    fetch("http://localhost:5555/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Formik validation schema using Yup
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    content: Yup.string().required("Content is required"),
    userId: Yup.string().required("Author is required"),
  });

  return (
    <div>
      <h2>Create Post</h2>
      <Formik
        initialValues={{
          title: "",
          content: "",
          userId: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          const { title, content, userId } = values;

          const newPost = {
            title,
            content,
            user_id: userId,
          };

          // Log the values before sending the request
          console.log("Submitting post with values:", values);

          fetch("http://localhost:5555/posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPost),
          })
            .then((response) => response.json())
            .then((data) => {
              setMessage("Post created successfully!");
              setSubmitting(false);
            })
            .catch((error) => {
              console.error("Error creating post:", error);
              setMessage("Error creating post. Please try again.");
              setSubmitting(false);
            });
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="title">Title</label>
              <Field type="text" id="title" name="title" required />
              <ErrorMessage
                name="title"
                component="div"
                style={{ color: "red" }}
              />
            </div>

            <div>
              <label htmlFor="content">Content</label>
              <Field as="textarea" id="content" name="content" required />
              <ErrorMessage
                name="content"
                component="div"
                style={{ color: "red" }}
              />
            </div>

            <div>
              <label htmlFor="userId">Select Author</label>
              <Field
                as="select"
                id="userId"
                name="userId"
                onChange={(e) => setFieldValue("userId", e.target.value)}
                required
              >
                <option value="">--Select Author--</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="userId"
                component="div"
                style={{ color: "red" }}
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Post"}
            </button>
          </Form>
        )}
      </Formik>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CreatePost;
