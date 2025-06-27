import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreatePost from './CreatePost';
import './GroupFeed.css';

function GroupFeed() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [creating, setCreating] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = storedUser?._id || storedUser?.id || null;
  const currentUserName = storedUser?.name || storedUser?.firstName || 'משתמש';
  const currentUserAvatar = storedUser?.profilePicture || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${groupId}`);
        setGroup(res.data);
      } catch (err) {
        setGroup(null);
      }
    };
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/group/${groupId}`);
        setPosts(res.data);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
    fetchPosts();
  }, [groupId]);

  const handleCreatePost = async (newPost) => {
    setCreating(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/group/${groupId}/create`, {
        text: newPost.content,
        userId: currentUserId,
        userName: currentUserName,
      });
      setPosts([res.data, ...posts]);
    } catch (err) {
      alert('שגיאה ביצירת פוסט');
    }
    setCreating(false);
  };

  const handleEditClick = (post) => {
    setEditingPostId(post._id);
    setEditText(post.text);
  };

  const handleEditSave = async (postId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}`, { text: editText });
      setPosts(posts.map(p => (p._id === postId ? { ...p, text: res.data.text } : p)));
      setEditingPostId(null);
      setEditText('');
    } catch (err) {
      alert('שגיאה בעדכון פוסט');
    }
  };

  if (loading) return <div className="loading">טוען...</div>;
  if (!group) return <div className="loading">הקבוצה לא נמצאה</div>;

  return (
    <div className="feed-dashboard group-feed-dashboard" dir="rtl">
      <div className="sidebar">
        <div className="profile-card group-info-card">
          <div className="profile-avatar">
            <div className="avatar-placeholder">👥</div>
          </div>
          <div className="profile-info">
            <div className="profile-name">{group.name}</div>
            <div className="profile-city">{group.description || 'אין תיאור'}</div>
          </div>
          <div className="profile-section-title">חברי הקבוצה</div>
          <div className="groups-list members-list">
            {group.members && group.members.length > 0 ? (
              group.members.map((member) => (
                <div key={member._id || member.id} className="group-item member-card">
                  <img
                    src={member.profilePicture || 'https://via.placeholder.com/40'}
                    alt={member.name || member.firstName || 'משתמש'}
                    className="member-avatar"
                  />
                  <span className="group-name">{((member.firstName || '') + ' ' + (member.lastName || '')).trim() || member.email || member._id || 'משתמש'}</span>
                </div>
              ))
            ) : (
              <div className="no-members">אין חברים בקבוצה</div>
            )}
          </div>
        </div>
        <div className="groups-card">
          <button className="edit-profile-btn" onClick={() => navigate('/feed')}>חזור לדף הבית</button>
        </div>
      </div>
      <div className="main-content">
        <div className="main-header">
          <h2 style={{margin: 0}}>פיד הקבוצה</h2>
        </div>
        <div className="create-post-section">
          <CreatePost onPost={handleCreatePost} currentUser={{ id: currentUserId, name: currentUserName, avatar: currentUserAvatar }} />
        </div>
        <div className="posts-section">
          {posts.length === 0 ? (
            <div className="no-posts">אין פוסטים בקבוצה זו</div>
          ) : (
            posts.map((post) => (
              <div key={post._id || post.id} className="post-card group-post-card">
                <div className="post-header">
                  <div className="post-avatar">
                    <img
                      src={post.userAvatar || 'https://via.placeholder.com/40'}
                      alt={post.userName || 'משתמש'}
                      className="user-avatar"
                    />
                  </div>
                  <div className="post-user-info">
                    <div className="post-user-name">{post.userName || 'משתמש'}</div>
                    <div className="post-time">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</div>
                  </div>
                </div>
                {editingPostId === post._id ? (
                  <div className="edit-post-form">
                    <textarea className="create-post-textarea" value={editText} onChange={e => setEditText(e.target.value)} />
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button className="create-post-btn" onClick={() => handleEditSave(post._id)}>שמור</button>
                      <button className="create-post-btn" style={{background:'#e0e7ef',color:'#222'}} onClick={() => setEditingPostId(null)}>ביטול</button>
                    </div>
                  </div>
                ) : (
                  <div className="post-content">{post.text}</div>
                )}
                {post.userId === currentUserId && editingPostId !== post._id && (
                  <div className="post-actions">
                    <button className="post-action-btn" onClick={() => handleEditClick(post)}>ערוך</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupFeed; 