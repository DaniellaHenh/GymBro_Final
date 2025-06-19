import React, { useState, useEffect } from 'react';
import './Feed.css';
import axios from 'axios';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');
  const [userProfile, setUserProfile] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  
  // הנח: מזהה המשתמש הנוכחי נשמר במקום כלשהו (למשל localStorage או context)
  // תחליף את זה בהתאם למערכת שלך
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = storedUser?._id || null;
  console.log(currentUserId);
  

  // טען פרופיל משתמש מה-API לפי currentUserId
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

  // טען פוסטים מהשרת
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
    if (!newPost.trim() || !userProfile || !currentUserId) return;

    try {
      await axios.post('http://localhost:5000/api/posts/create', {
        text: newPost,
        userId: currentUserId,
        userName: userProfile.name || userProfile.firstName || 'משתמש',
        likes: [],
        comments: [],
      });

      setNewPost('');

      // רענון הפוסטים לאחר הוספה
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data.posts || res.data);
    } catch (error) {
      console.error('שגיאה בהוספת פוסט:', error);
    }
  };

  // סינון פוסטים לפי המשתמש הנוכחי
  const myPosts = posts.filter(post => post.userId === currentUserId);
  const recentPosts = posts;

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
              <div className="avatar-placeholder" />
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
                <span className="group-name">{group.name || group}</span>
                {group.members && <span className="group-members">{group.members} חברים</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
  
      <div className="main-content">
        <div className="main-header">
          <button className="edit-profile-btn">ערוך פרופיל</button>
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
                    <div className="avatar-placeholder" />
                  </div>
                  <div className="post-user-info">
                    <div className="post-user-name">{post.userName || 'משתמש'}</div>
                    <div className="post-time">
                      {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
                <div className="post-content">{post.text}</div>
                <div className="post-actions">
                  <button className="post-action-btn">ערוך</button>
                  <button className="post-action-btn">מחק</button>
                </div>
              </div>
            ))
          )}
        </div>
  
        <form className="create-post-form" onSubmit={handlePostSubmit}>
          <textarea
            className="create-post-textarea"
            placeholder="מה חדש? שתף אותנו..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button type="submit" className="create-post-btn">פרסם</button>
        </form>
      </div>
    </div>
  );
  
}

export default Feed;
