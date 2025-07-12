import React, { useState } from 'react';
import './CreatePost.css';

function CreatePost({ onPost, currentUser }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost = {
      id: Date.now(),
      content,
      image,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString()
    };

    onPost(newPost);
    setContent('');
    setImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="post-input"
        />
        <div className="post-actions">
          <label className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-input"
            />
            Add Photo
          </label>
          <button type="submit" className="post-button">Post</button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost; 