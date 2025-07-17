import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreatePost from './CreatePost';
import './GroupFeed.css';
import WeeklyPostD3Chart from './WeeklyPostD3Chart';
import GroupGenderPieChart from './GroupGenderPieChart';

function GroupFeed() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [creating, setCreating] = useState(false);
  const [commentTextMap, setCommentTextMap] = useState({});
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
      const formData = new FormData();
      formData.append('text', newPost.content.trim() || '');
      formData.append('userId', currentUserId);
      formData.append('userName', currentUserName);
      formData.append('groupId', groupId);
      if (newPost.mediaFiles && newPost.mediaFiles.length > 0) {
        newPost.mediaFiles.forEach(file => {
          formData.append('media', file);
        });
      }
      const res = await axios.post(`http://localhost:5000/api/posts/group/${groupId}/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPosts(posts => [res.data, ...posts]);
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

  const handleLike = async (postId) => {
    if (!currentUserId) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, { userId: currentUserId });
      setPosts(posts => posts.map(post => (post._id === postId || post.id === postId) ? res.data : post));
    } catch (err) {
      console.error('שגיאה בלייק:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = commentTextMap[postId];
    if (!commentText?.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
        userId: currentUserId,
        userName: currentUserName,
        text: commentText.trim(),
      });
      setPosts(posts => posts.map(post => post._id === postId ? res.data : post));
      setCommentTextMap({ ...commentTextMap, [postId]: '' });
    } catch (err) {
      console.error('שגיאה בתגובה:', err);
    }
  };

  const getAvatarForPost = (post) => {
    if (post.userAvatar) return post.userAvatar;
    const matchingMember = group.members?.find(member => {
      const memberId = typeof member === 'string' ? member : member._id;
      return memberId === post.userId;
    });
    if (matchingMember?.profilePicture) {
      return matchingMember.profilePicture.startsWith('http')
        ? matchingMember.profilePicture
        : `http://localhost:5000${matchingMember.profilePicture}`;
    }
    return '/default-avatar.png';
  };

  if (loading) return <div className="loading">טוען...</div>;
  if (!group) return <div className="loading">הקבוצה לא נמצאה</div>;
  const isMember = group.members && group.members.some(member => {
    const memberId = typeof member === 'string' ? member : member._id;
    return memberId === currentUserId;
  });
  if (!isMember) {
    return (
      <div className="feed-dashboard group-feed-dashboard" dir="rtl">
        <div className="sidebar">
          <div className="profile-card group-info-card">
            <div className="profile-avatar"><div className="avatar-placeholder">👥</div></div>
            <div className="profile-info">
              <div className="profile-name">{group.name}</div>
              <div className="profile-city">{group.description || 'אין תיאור'}</div>
            </div>
          </div>
          <div className="groups-card">
            <button className="edit-profile-btn" onClick={() => navigate('/feed')}>חזור לדף הבית</button>
          </div>
        </div>
        <div className="main-content">
          <div className="main-header"><h2>פיד הקבוצה</h2></div>
          <div className="not-member-message" style={{color: 'red', fontWeight: 'bold', marginTop: '2rem', textAlign: 'center'}}>
            אינך חבר בקבוצה זו. רק חברי קבוצה יכולים לצפות בפוסטים.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-dashboard group-feed-dashboard" dir="rtl">
      <div className="sidebar">
        <div className="profile-card group-info-card">
          <div className="profile-avatar"><div className="avatar-placeholder">👥</div></div>
          <div className="profile-info">
            <div className="profile-name">{group.name}</div>
            <div className="profile-city">{group.description || 'אין תיאור'}</div>
          </div>
          <div className="profile-section-title">חברי הקבוצה</div>
          <div className="groups-list members-list">
            {group.members?.map((member) => (
              <div key={member._id || member.id} className="group-item member-card">
                <img src={member.profilePicture?.startsWith('http') ? member.profilePicture : `http://localhost:5000${member.profilePicture}`} alt={member.name || 'משתמש'} className="member-avatar" />
                <span className="group-name">{((member.firstName || '') + ' ' + (member.lastName || '')).trim() || member.email || member._id || 'משתמש'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="groups-card"><button className="edit-profile-btn" onClick={() => navigate('/feed')}>חזור לדף הבית</button></div>
        <div className="groups-card"><WeeklyPostD3Chart groupId={groupId} /></div>
        <div className="groups-card"><GroupGenderPieChart members={group.members} /></div>
      </div>

      <div className="main-content">
        <div className="main-header"><h2>פיד הקבוצה</h2></div>
        <div className="create-post-section">
          <CreatePost onPost={handleCreatePost} currentUser={{ id: currentUserId, name: currentUserName, avatar: currentUserAvatar }} />
        </div>
        <div className="posts-section">
          {posts.length === 0 ? <div className="no-posts">אין פוסטים בקבוצה זו</div> : posts.map((post) => (
            <div key={post._id || post.id} className="post-card group-post-card">
              <div className="post-header">
                <div className="post-avatar">
                  <img src={getAvatarForPost(post)} alt={post.userName || 'משתמש'} className="user-avatar" />
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
                <>
                  <div className="post-content">{post.text}</div>
                  {(post.mediaUrls?.length > 0 || post.mediaUrl) && (
                    <div className="post-media">
                      {post.mediaUrls?.map((url, i) => (
                        <div key={i} className="media-item">
                          {url.match(/\.(mp4|webm|ogg)$/i) ? <video controls><source src={`http://localhost:5000${url}`} /></video> : <img src={`http://localhost:5000${url}`} alt="media" />}
                        </div>
                      ))}
                      {post.mediaUrl && !post.mediaUrls && (
                        <div className="media-item">
                          {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? <video controls><source src={`http://localhost:5000${post.mediaUrl}`} /></video> : <img src={`http://localhost:5000${post.mediaUrl}`} alt="media" />}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {post._id && typeof post._id === 'string' && post._id.length === 24 && (
                <div className="post-likes-row">
                  <button className="like-btn" onClick={() => handleLike(post._id)}>
                    {post.likes?.includes(currentUserId) ? '❤️' : '🤍'}
                  </button>
                  <span className="likes-count">{post.likes?.length || 0} לייקים</span>
                </div>
              )}
              {post.userId === currentUserId && editingPostId !== post._id && (
                <div className="post-actions">
                  <button className="post-action-btn" onClick={() => handleEditClick(post)}>ערוך</button>
                </div>
              )}
              {/* תגובות */}
                <div className="comments-section">
              <div className="comments-list">
                {post.comments?.length ? (
                  post.comments.map((comment, i) => (
                    <div key={i} className="comment-item">
                      <span className="comment-user">{comment.userName}</span>
                      <span className="comment-text">{comment.text}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">אין תגובות עדיין</div>
                )}
              </div>
              <div className="add-comment-form">
                <input
                  type="text"
                  className="add-comment-input"
                  placeholder="הוסף תגובה..."
                  value={commentTextMap[post._id] || ''}
                  onChange={e => setCommentTextMap({ ...commentTextMap, [post._id]: e.target.value })}
                />
                <button className="add-comment-btn" onClick={() => handleAddComment(post._id)}>שלח</button>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroupFeed;