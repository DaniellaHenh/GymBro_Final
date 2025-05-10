import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import './Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');
  const [userProfile, setUserProfile] = useState(null);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    // Fetch user profile from Firestore
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
          // If groups are stored in user profile, set them
          if (userSnap.data().groups) {
            setUserGroups(userSnap.data().groups);
          }
        }
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !userProfile) return;
    try {
      await addDoc(collection(db, 'posts'), {
        text: newPost,
        userId: auth.currentUser.uid,
        userName: userProfile.name || userProfile.firstName || 'משתמש',
        timestamp: serverTimestamp(),
        likes: [],
        comments: []
      });
      setNewPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  // Filter posts for tabs
  const myPosts = posts.filter(post => post.userId === auth.currentUser?.uid);
  const recentPosts = posts;

  return (
    <div className="feed-dashboard" dir="rtl">
      <div className="sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {userProfile?.profilePicture ? (
              <img src={userProfile.profilePicture} alt={userProfile.name || userProfile.firstName} />
            ) : (
              <div className="avatar-placeholder" />
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name">{userProfile?.name || userProfile?.firstName || 'משתמש'}</div>
            <div className="profile-city">{userProfile?.city || userProfile?.location || ''}</div>
          </div>
          <div className="profile-section-title">פרטים אישיים</div>
          <div className="profile-details">
            <div><span className="profile-label">רמת ניסיון:</span> {userProfile?.experienceLevel || userProfile?.experience || ''}</div>
            <div><span className="profile-label">מיקום:</span> {userProfile?.city || userProfile?.location || ''}</div>
            <div><span className="profile-label">סוג אימון מועדפים:</span> {(userProfile?.workoutTypes || []).map(type => <span className="profile-tag" key={type}>{type}</span>)}</div>
            <div><span className="profile-label">שעות אימון מועדפות:</span> {(userProfile?.preferredTimes || userProfile?.times || []).map(time => <span className="profile-tag" key={time}>{time}</span>)}</div>
          </div>
        </div>
        <div className="groups-card">
          <div className="groups-title">הקבוצות שלי</div>
          <div className="groups-list">
            {(userGroups.length > 0 ? userGroups : []).map(group => (
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
          ) : (
            (activeTab === 'myPosts' ? myPosts : recentPosts).length === 0 ? (
              <div className="no-posts">לא נמצאו פוסטים</div>
            ) : (
              (activeTab === 'myPosts' ? myPosts : recentPosts).map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-avatar">
                      <div className="avatar-placeholder" />
                    </div>
                    <div className="post-user-info">
                      <div className="post-user-name">{post.userName || 'משתמש'}</div>
                      <div className="post-time">{post.timestamp?.toDate().toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="post-content">{post.text}</div>
                  <div className="post-actions">
                    <button className="post-action-btn">ערוך</button>
                    <button className="post-action-btn">מחק</button>
                  </div>
                </div>
              ))
            )
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