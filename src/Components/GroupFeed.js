import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function GroupFeed() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/posts`);
        setPosts(res.data.posts || res.data);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
    fetchPosts();
  }, [groupId]);

  if (loading) return <div>טוען...</div>;
  if (!group) return <div>הקבוצה לא נמצאה</div>;

  return (
    <div className="group-feed-container" dir="rtl">
      <h2>{group.name}</h2>
      <div className="group-info">
        <div>תיאור: {group.description || 'אין תיאור'}</div>
        <div>חברים: {group.members ? group.members.length : 0}</div>
      </div>
      <h3>פוסטים בקבוצה</h3>
      <div className="group-posts">
        {posts.length === 0 ? (
          <div>אין פוסטים בקבוצה זו</div>
        ) : (
          posts.map((post) => (
            <div key={post._id || post.id} className="group-post-card">
              <div className="post-header">
                <span className="post-user">{post.userName || 'משתמש'}</span>
                <span className="post-time">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</span>
              </div>
              <div className="post-content">{post.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GroupFeed; 