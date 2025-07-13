import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FindPartners.css';
import { useNavigate } from 'react-router-dom';

function FindPartners() {
  const [filters, setFilters] = useState({
    workoutType: '',
    experienceLevel: '',
    timeSlot: '',
    city: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const navigate = useNavigate();

  const workoutTypes = ['הרמת משקולות', 'ריצה', 'יוגה', 'קרוספיט', 'שחייה', 'אופניים', 'HIIT', 'פילאטיס'];
  const timeSlots = ['בוקר (6-9)', 'בוקר מאוחר (9-12)', 'צהריים (12-15)', 'אחר הצהריים (15-18)', 'ערב (18-21)', 'לילה (21-00)'];
  const experienceLevels = ['מתחיל', 'בינוני', 'מנוסה'];

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = storedUser?._id || null;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUserId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${currentUserId}`);
          setUserProfile(res.data);
          console.log('User Profile:', res.data);
          setFilters(prev => ({ ...prev, city: res.data.city }));
          if (res.data.groups) setUserGroups(res.data.groups);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };
    fetchUserProfile();
  }, [currentUserId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const searchPartners = async () => {
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/users/search-partners', {
        workoutType: filters.workoutType,
        availableTimes: filters.timeSlot,
        city: filters.city
      });

      const filtered = res.data.filter(user => user._id !== currentUserId);
      setUsers(filtered);
    } catch (err) {
      console.error('Error searching for partners:', err);
    }
    setLoading(false);
  };

 const followUser = async (followeeId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/${followeeId}/follow`, {
        followerId: currentUserId
      });
      setUserProfile(prev => ({
        ...prev,
        following: [...(prev?.following || []), followeeId]
      }));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

 const unfollowUser = async (followeeId) => { 
    try {
      await axios.post(`http://localhost:5000/api/users/${followeeId}/unfollow`, {
        followerId: currentUserId
      });
      setUserProfile(prev => ({
        ...prev,
        following: prev.following.filter(id => id !== followeeId)
      }));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };


   return (
    <div className="feed-dashboard" dir="rtl">
      <div className="sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {userProfile?.profilePicture ? (
              <img src={userProfile.profilePicture || '/default-avatar.png'} alt="avatar" />
            ) : (
              <div className="avatar-placeholder" />
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name">{userProfile?.firstName || 'משתמש'}</div>
            <div className="profile-city">{userProfile?.city || ''}</div>
          </div>
          <div className="profile-section-title">פרטים אישיים</div>
          <div className="profile-details">
            <div><span>רמת ניסיון:</span> {userProfile?.experienceLevel}</div>
            <div><span>מיקום:</span> {userProfile?.city}</div>
            <div><span>סוג אימון:</span> {(userProfile?.workoutTypes || []).map(type => <span className="profile-tag" key={type}>{type}</span>)}</div>
            <div><span>שעות מועדפות:</span> {(userProfile?.availableTimes || []).map(time => <span className="profile-tag" key={time}>{time}</span>)}</div>
          </div>
        </div>
        <div className="groups-card">
          <div className="groups-list">
            {userGroups.map((group) => (
              <div key={group._id} className="group-card">
                <span className="group-name-link" onClick={() => navigate(`/group/${group._id}`)}>
                  {group.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="main-header">
          <h2>חיפוש שותפים</h2>
        </div>

        <div className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <label>עיר</label>
              <input
                name="city"
                type="text"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>סוג אימון</label>
              <select name="workoutType" value={filters.workoutType} onChange={handleFilterChange}>
                <option value="">הכל</option>
                {workoutTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>שעות מועדפות</label>
              <select name="timeSlot" value={filters.timeSlot} onChange={handleFilterChange}>
                <option value="">הכל</option>
                {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <button onClick={searchPartners} className="search-button">
              חפש שותפים
            </button>
          </div>
        </div>

        <div className="results-section">
          {loading ? (
            <div>טוען...</div>
          ) : (
            <div className="users-grid">
              {users.length === 0 ? (
                <div>לא נמצאו שותפים</div>
              ) : (
                users.map(user => {
                  const isFollowing = userProfile?.following?.includes(user._id); // ✅ חדש: בדיקה אם עוקבים אחרי המשתמש הזה
                  return (
                    <div key={user._id} className="user-card">
                      <img src={user.profilePicture || '/default-avatar.png'} alt="avatar" />
                      <h3>{user.firstName} {user.lastName}</h3>
                      <p>עיר: {user.city}</p>
                      <p>אימונים: {(user.workoutTypes || []).join(', ')}</p>
                      <p>שעות מועדפות: {(user.availableTimes || []).join(', ')}</p>
                      {isFollowing ? (
                        <button className="disconnect-button" onClick={() => unfollowUser(user._id)}>
                          הסר שותף 
                        </button>
                      ) : (
                        <button className="connect-button" onClick={() => followUser(user._id)}>
                          חבר שותף 
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindPartners;
