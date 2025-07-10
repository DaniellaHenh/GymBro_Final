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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
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
        console.error('Failed to search users');
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
            users.map((user) => (
              <div
                key={user._id}
                className="user-card"
                onClick={() => handleUserClick(user._id)}
              >
                <div className="user-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="user-email">{user.email}</div>
                  {user.city && <div className="user-city">{user.city}</div>}
                  {user.experienceLevel && (
                    <div className="user-experience">רמה: {user.experienceLevel}</div>
                  )}
                  {user.workoutTypes && user.workoutTypes.length > 0 && (
                    <div className="user-workout-types">
                      {user.workoutTypes.slice(0, 3).map((type, index) => (
                        <span key={index} className="workout-tag">
                          {type}
                        </span>
                      ))}
                      {user.workoutTypes.length > 3 && (
                        <span className="workout-tag">+{user.workoutTypes.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : searchQuery && !loading ? (
            <div className="no-results">לא נמצאו משתמשים</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers; 