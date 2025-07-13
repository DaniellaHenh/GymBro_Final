import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreatePost from './CreatePost';
import './GroupFeed.css';
import WeeklyPostD3Chart from './WeeklyPostD3Chart';


function GroupFeed() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [creating, setCreating] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
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
        // Check if current user is a member
        setIsMember(res.data.members && res.data.members.some(member => 
          member._id === currentUserId || member.id === currentUserId
        ));
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
    checkJoinRequestStatus();
  }, [groupId, currentUserId]);

  const checkJoinRequestStatus = async () => {
    try {
      const response = await fetch(`/api/join-requests/user/${currentUserId}`);
      const requests = await response.json();
      const hasPendingRequest = requests.some(req => 
        req.groupId === groupId && req.status === 'pending'
      );
      setJoinRequestSent(hasPendingRequest);
    } catch (error) {
      console.error('Error checking join request status:', error);
    }
  };

  const handleJoinRequest = async () => {
    try {
      const response = await fetch('/api/join-requests/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          userId: currentUserId,
          message: joinRequestMessage
        })
      });
      
      if (response.ok) {
        setJoinRequestSent(true);
        setShowJoinRequestModal(false);
        setJoinRequestMessage('');
        alert('בקשת ההצטרפות נשלחה בהצלחה!');
      } else {
        const error = await response.json();
        alert(`שגיאה: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      alert('שגיאה בשליחת בקשת ההצטרפות');
    }
  };

  const handleCreatePost = async (newPost) => {
    setCreating(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/group/${groupId}/create`, {
        text: newPost.content,
        userId: currentUserId,
        userName: currentUserName,
        groupId
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

  const handleCancelRequest = async (requestId) => {
    await fetch(`/api/join-requests/cancel/${requestId}/${currentUserId}`, { method: 'DELETE' });
    // Refresh requests list after cancel
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
          
          {/* Join Request Section */}
          {!isMember && (
            <div className="join-request-section">
              {joinRequestSent ? (
                <div className="request-sent">
                  <p>בקשת הצטרפות נשלחה וממתינה לאישור</p>
                </div>
              ) : (
                <button 
                  className="join-request-btn"
                  onClick={() => setShowJoinRequestModal(true)}
                >
                  בקש להצטרף לקבוצה
                </button>
              )}
            </div>
          )}
          
          <div className="profile-section-title">חברי הקבוצה</div>
          <div className="groups-list members-list">
            {group.members && group.members.length > 0 ? (
              group.members.map((member) => (
                <div key={member._id || member.id} className="group-item member-card">
                  <img
                    src={member.profilePicture || '/default-avatar.png'}
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
        <div className="groups-card">
        <WeeklyPostD3Chart groupId={groupId} />
      </div>
      </div>
      <div className="main-content">
        <div className="main-header">
          <h2 style={{margin: 0}}>פיד הקבוצה</h2>
        </div>
        
        {/* Only show create post and posts if user is a member */}
        {isMember ? (
          <>
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
                          src={post.userAvatar || '/default-avatar.png'}
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
          </>
        ) : (
          <div className="not-member-message">
            <h3>אינך חבר בקבוצה זו</h3>
            <p>בקש להצטרף כדי לראות את הפוסטים ולפרסם תוכן</p>
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {showJoinRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>בקשת הצטרפות לקבוצה</h3>
            <p>שלח הודעה למנהל הקבוצה (אופציונלי):</p>
            <textarea
              value={joinRequestMessage}
              onChange={(e) => setJoinRequestMessage(e.target.value)}
              placeholder="הסבר למה אתה רוצה להצטרף לקבוצה..."
              className="join-request-textarea"
            />
            <div className="modal-actions">
              <button onClick={handleJoinRequest} className="join-request-submit-btn">
                שלח בקשה
              </button>
              <button onClick={() => setShowJoinRequestModal(false)} className="cancel-btn">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupFeed; 