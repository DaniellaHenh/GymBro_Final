import React, { useState } from 'react';
import './CreatePost.css';

function CreatePost({ onPost, currentUser }) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Allow posts with just media or just text
    if (!content.trim() && mediaFiles.length === 0) return;

    const newPost = {
      id: Date.now(),
      content: content.trim() || '',
      mediaFiles,
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
    setMediaFiles([]);
  };

  const handleMediaChange = (e) => {
    console.log('Files selected:', e.target.files);
    setMediaFiles(Array.from(e.target.files));
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="מה חדש? שתף אותנו..."
          className="post-input"
        />
        <div className="post-actions">
          <div className="upload-section">
            <label className="upload-button">
              <input
                type="file"
                name="media"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                style={{ display: 'none' }}
              />
              <span className="upload-icon">+</span>
              <span className="upload-text">
                {mediaFiles.length > 0 ? `הוסף קבצים (${mediaFiles.length})` : 'הוסף תמונה או וידאו'}
              </span>
            </label>
            {mediaFiles.length > 0 && (
              <div className="file-info">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <button 
                      type="button" 
                      className="remove-file-btn"
                      onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== index))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="post-button">פרסם</button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost; 