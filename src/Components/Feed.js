import React, { useState, useEffect } from 'react';
import './Feed.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');
  const [userProfile, setUserProfile] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);

  const navigate = useNavigate(); 
  // הנח: מזהה המשתמש הנוכחי נשמר במקום כלשהו (למשל localStorage או context)
  // תחליף את זה בהתאם למערכת שלך
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = storedUser?._id || null;
  console.log(currentUserId);
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUserId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${currentUserId}`);
          setUserProfile(res.data);
          console.log(res.data);
          if (res.data.groups) setUserGroups(res.data.groups);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };
    fetchUserProfile();
  }, [currentUserId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data.posts || res.data);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת פוסטים:', err);
      }
    };
    fetchPosts();
  }, []);

  // הוסף פוסט חדש
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('newPost:', newPost);
    console.log('mediaFile:', mediaFiles);
    console.log('userProfile:', userProfile);
    console.log('currentUserId:', currentUserId);
    
    // Allow posts with just media or just text
    if ((!newPost.trim() && mediaFiles.length === 0) || !userProfile || !currentUserId) {
      console.log('Validation failed - need either text or media, and user info');
      return;
    }

    try {
      const formData = new FormData();
      if (newPost.trim()) {
        formData.append('text', newPost);
      } else {
        formData.append('text', ''); // Empty text for media-only posts
      }
      formData.append('userId', currentUserId);
      formData.append('userName', userProfile.name || userProfile.firstName || 'משתמש');
      formData.append('likes', JSON.stringify([]));
      formData.append('comments', JSON.stringify([]));
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      console.log('Sending request to server...');
      
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value);
      }
      
      const res = await axios.post('http://localhost:5000/api/posts/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Post created successfully');
      setNewPost('');
      setMediaFiles([]);

      // Add the new post from backend to the top of the list
      setPosts(posts => [res.data, ...posts]);
    } catch (error) {
      console.error('שגיאה בהוספת פוסט:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  
  const handleEditClick = (post) => {
    setEditingPostId(post._id || post.id); // מזהה הפוסט שנבחר לעריכה
    setEditText(post.text); // ממלא את הטקסט הקיים ב־textarea
  };

  const handleEditSave = async () => {
    if (!editText.trim()) {
      alert('הטקסט לא יכול להיות ריק');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/posts/${editingPostId}`, { text: editText });

      setPosts(posts.map(post =>
        (post._id === editingPostId || post.id === editingPostId)
          ? { ...post, text: editText }
          : post
      ));

      setEditingPostId(null); // יוצא ממצב עריכה
      setEditText(''); // מאפס את הטקסט בעריכה
    } catch (error) {
      console.error('שגיאה בעדכון הפוסט:', error);
      alert('לא הצלחנו לעדכן את הפוסט, נסה שוב.');
    }
  };

  const handleEditCancel = () => {
    setEditingPostId(null);
    setEditText('');
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('אתה בטוח שברצונך למחוק את הפוסט?')) return; // אישור לפני מחיקה

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);

      setPosts(posts.filter(post => post._id !== postId && post.id !== postId));
    } catch (error) {
      console.error('שגיאה במחיקת הפוסט:', error);
      alert('לא הצלחנו למחוק את הפוסט, נסה שוב.');
    }
  };

  
  // סינון פוסטים לפי המשתמש הנוכחי
  const myPosts = posts.filter(post => post.userId === currentUserId);
  const recentPosts = posts;

  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/groups');
        setAllGroups(res.data);
      } catch (err) {
        console.error('Error fetching all groups:', err);
      }
    };
    fetchAllGroups();
  }, []);

  const handleJoinRequest = async (groupId, creatorId) => {
    // You can send a request to your backend to join the group or notify the creator
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`http://localhost:5000/api/groups/join/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });
      if (res.ok) {
        alert('בקשתך נשלחה!');
      } else {
        alert('שגיאה בשליחת הבקשה');
      }
    } catch (err) {
      alert('שגיאה בשליחת הבקשה');
    }
  };

  // Like/unlike a post
  const handleLike = async (postId) => {
    if (!currentUserId) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, { userId: currentUserId });
      setPosts(posts => posts.map(post => (post._id === postId || post.id === postId) ? res.data : post));
    } catch (err) {
      console.error('שגיאה בלייק:', err);
    }
  };

return (
  <div className="feed-dashboard" dir="rtl">
    <div className="sidebar">
      <div className="profile-card">
        <div className="profile-avatar">
          {userProfile?.profilePicture ? (
            <img
              src={userProfile.profilePicture}
              alt={`${userProfile.firstName || ''} ${userProfile.lastName || ''}`}
            />
          ) : (
            <img src="/default-avatar.png" alt="avatar" />
          )}
        </div>
        <div className="profile-info">
          <div className="profile-name">
            {(userProfile?.firstName || '') + ' ' + (userProfile?.lastName || '') || 'משתמש'}
          </div>
          <div className="profile-city">{userProfile?.city || ''}</div>
        </div>
        <div className="profile-section-title">פרטים אישיים</div>
        <div className="profile-details">
          <div>
            <span className="profile-label">רמת ניסיון:</span>{' '}
            {userProfile?.experienceLevel || 'לא הוגדר'}
          </div>
          <div>
            <span className="profile-label">מיקום:</span> {userProfile?.city || ''}
          </div>
          <div>
            <span className="profile-label">סוגי אימון מועדפים:</span>{' '}
            {(userProfile?.workoutTypes || []).map((type) => (
              <span className="profile-tag" key={type}>{type}</span>
            ))}
          </div>
          <div>
            <span className="profile-label">שעות אימון מועדפות:</span>{' '}
            {(userProfile?.availableTimes || []).map((time) => (
              <span className="profile-tag" key={time}>{time}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="groups-card">
        <div className="groups-title">הקבוצות שלי</div>
        <div className="groups-list">
          {(userGroups.length > 0 ? userGroups : []).map((group) => (
            <div className="group-item" key={group.name || group}>
              <span className="group-icon">👥</span>
              <span
                className="group-name-link"
                style={{ color: '#4e8c85', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/group/${group._id}`)}
              >
                {group.name || group}
              </span>
              {group.members && <span className="group-members">{group.members} חברים</span>}
            </div>
          ))}
        </div>
        <div className="groups-title">כל הקבוצות</div>
        <div className="groups-list">
          {allGroups.map(group => (
            <div className="group-item" key={group._id}>
              <span className="group-icon">👥</span>
              <span
                className="group-name-link"
                style={{ color: '#4e8c85', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/group/${group._id}`)}
              >
                {group.name}
              </span>
              <span className="group-members">{group.members.length} חברים</span>
              <button className="connect-button" onClick={() => handleJoinRequest(group._id, group.createdBy)}>
                בקש להצטרף
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="main-content">
      <div className="main-header">
        <button className="edit-profile-btn" onClick={() => navigate('/profile')}>ערוך פרופיל</button>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'myPosts' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('myPosts')}
        >
          הפוסטים שלי
        </button>
        <button
          className={activeTab === 'recent' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('recent')}
        >
          הפעילויות האחרונות
        </button>
      </div>

      <div className="posts-section">
        {loading ? (
          <div className="loading">טוען פוסטים...</div>
        ) : (activeTab === 'myPosts' ? myPosts : recentPosts).length === 0 ? (
          <div className="no-posts">לא נמצאו פוסטים</div>
        ) : (
          (activeTab === 'myPosts' ? myPosts : recentPosts).map((post) => (
            <div key={post._id || post.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">
                  <img
                    src={post.userAvatar || '/default-avatar.png'}
                    alt={post.userName || 'משתמש'}
                     width={36}
                     height={36}
                  />
                </div>
                <div className="post-user-info">
                  <div className="post-user-name">{post.userName || 'משתמש'}</div>
                  <div className="post-time">
                    {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>

              {/* מצב עריכה: אם הפוסט הוא הפוסט שנבחר לעריכה, להראות textarea וכפתורים */}
              {editingPostId === (post._id || post.id) ? (
                <>
                  <textarea
                    className="edit-post-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="post-actions">
                    <button onClick={handleEditSave} className="post-action-btn save-btn">שמור</button>
                    <button onClick={handleEditCancel} className="post-action-btn cancel-btn">בטל</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="post-content">{post.text}</div>
                  {/* Show media if exists - handle both old and new formats */}
                  {(post.mediaUrls && post.mediaUrls.length > 0) || post.mediaUrl ? (
                    <div className="post-media">
                      {/* Handle new format (array of URLs) */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && 
                        post.mediaUrls.map((mediaUrl, index) => (
                          <div key={index} className="media-item">
                            {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video controls style={{ maxWidth: '100%', margin: '5px 0' }}>
                                <source src={`http://localhost:5000${mediaUrl}`} />
                                הדפדפן שלך לא תומך בניגון וידאו
                              </video>
                            ) : (
                              <img src={`http://localhost:5000${mediaUrl}`} alt="media" style={{ maxWidth: '100%', margin: '5px 0' }} />
                            )}
                          </div>
                        ))
                      }
                      {/* Handle old format (single URL) */}
                      {post.mediaUrl && !post.mediaUrls && (
                        <div className="media-item">
                          {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video controls style={{ maxWidth: '100%', margin: '5px 0' }}>
                              <source src={`http://localhost:5000${post.mediaUrl}`} />
                              הדפדפן שלך לא תומך בניגון וידאו
                            </video>
                          ) : (
                            <img src={`http://localhost:5000${post.mediaUrl}`} alt="media" style={{ maxWidth: '100%', margin: '5px 0' }} />
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="post-actions">
                    <button onClick={() => handleEditClick(post)} className="post-action-btn">ערוך</button>
                    <button onClick={() => handleDeletePost(post._id || post.id)} className="post-action-btn">מחק</button>
                  </div>
                  {/* Like button and count, only for valid MongoDB ObjectID */}
                  {post._id && typeof post._id === 'string' && post._id.length === 24 && (
                    <div className="post-likes-row">
                      <button
                        className="like-btn"
                        onClick={() => handleLike(post._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '8px' }}
                        aria-label={post.likes && post.likes.includes(currentUserId) ? 'בטל לייק' : 'עשה לייק'}
                      >
                        {post.likes && post.likes.includes(currentUserId) ? '❤️' : '🤍'}
                      </button>
                      <span className="likes-count">{post.likes ? post.likes.length : 0} לייקים</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <form className="create-post-form" onSubmit={handlePostSubmit} encType="multipart/form-data">
        <textarea
          className="create-post-textarea"
          placeholder="מה חדש? שתף אותנו..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="form-actions">
          <div className="upload-section">
            <label className="upload-button">
              <input
                type="file"
                name="media"
                accept="image/*,video/*"
                multiple // Allow multiple files
                onChange={e => {
                  console.log('Files selected:', e.target.files);
                  setMediaFiles(Array.from(e.target.files));
                }}
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
          <button type="submit" className="create-post-btn">פרסם</button>
        </div>
      </form>
    </div>
  </div>
);


}

export default Feed;
