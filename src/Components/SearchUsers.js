import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchUsers.css';

const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const res = await fetch(`http://localhost:5000/api/users/${user._id}`);
          const fullUser = await res.json();
          setCurrentUser(fullUser); // כולל .following
        } catch (err) {
          console.error('Error fetching current user:', err);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}&currentUserId=${currentUser?._id || ''}`
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const followUser = async (followeeId) => {
    try {
      await fetch(`http://localhost:5000/api/users/${followeeId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser._id })
      });
      setCurrentUser(prev => ({
        ...prev,
        following: [...(prev.following || []), followeeId]
      }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const unfollowUser = async (followeeId) => {
    try {
      await fetch(`http://localhost:5000/api/users/${followeeId}/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser._id })
      });
      setCurrentUser(prev => ({
        ...prev,
        following: prev.following.filter(id => id !== followeeId)
      }));
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  return (
    <div className="search-users-container" dir="rtl">
      <div className="search-users-box">
        <h2 className="search-users-title">חיפוש משתמשים</h2>

        <div className="search-input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לפי שם, אימייל, עיר, סוג אימון..."
            className="search-input"
          />
          {loading && <div className="search-loading">מחפש...</div>}
        </div>

        <div className="search-results">
          {users.length > 0 ? (
            users.map((user) => {
              const isFollowing = currentUser?.following?.includes(user._id);
              return (
                <div key={user._id} className="user-card">
                  <div className="user-avatar" onClick={() => handleUserClick(user._id)}>
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="user-info" onClick={() => handleUserClick(user._id)}>
                    <div className="user-name">{user.firstName} {user.lastName}</div>
                    <div className="user-email">{user.email}</div>
                    {user.city && <div className="user-city">{user.city}</div>}
                    {user.experienceLevel && <div className="user-experience">רמה: {user.experienceLevel}</div>}
                    {user.workoutTypes && user.workoutTypes.length > 0 && (
                      <div className="user-workout-types">
                        {user.workoutTypes.slice(0, 3).map((type, index) => (
                          <span key={index} className="workout-tag">{type}</span>
                        ))}
                        {user.workoutTypes.length > 3 && (
                          <span className="workout-tag">+{user.workoutTypes.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="user-actions">
                    {isFollowing ? (
                      <button className="disconnect-button" onClick={() => unfollowUser(user._id)}>
                        הסר שותף
                      </button>
                    ) : (
                      <button className="connect-button" onClick={() => followUser(user._id)}>
                        התחבר
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : searchQuery && !loading ? (
            <div className="no-results">לא נמצאו משתמשים</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
