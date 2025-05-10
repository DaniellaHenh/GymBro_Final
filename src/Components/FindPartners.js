import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import './FindPartners.css';

function FindPartners() {
  const [filters, setFilters] = useState({
    workoutType: '',
    experienceLevel: '',
    distance: 10, // default km
    timeSlot: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserCity, setCurrentUserCity] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [userGroups, setUserGroups] = useState([]);

  const workoutTypes = ['Strength Training', 'Running', 'Yoga', 'CrossFit', 'Swimming', 'Cycling', 'HIIT', 'Pilates'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const timeSlots = ['Morning (6-9)', 'Late Morning (9-12)', 'Afternoon (12-3)', 'Late Afternoon (3-6)', 'Evening (6-9)'];
  const distanceOptions = [5, 10, 20, 50];

  useEffect(() => {
    // Fetch current user's city and profile
    const fetchCurrentUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setCurrentUserCity(data.location || '');
          setUserProfile(data);
          if (data.groups) setUserGroups(data.groups);
        }
      }
    };
    fetchCurrentUserData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const searchPartners = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'users');
      const conditions = [];
      if (filters.workoutType) {
        conditions.push(where('workoutTypes', 'array-contains', filters.workoutType));
      }
      if (filters.experienceLevel) {
        conditions.push(where('experienceLevel', '==', filters.experienceLevel.toLowerCase()));
      }
      if (filters.timeSlot) {
        conditions.push(where('preferredTimes', 'array-contains', filters.timeSlot));
      }
      if (currentUserCity) {
        conditions.push(where('location', '==', currentUserCity));
      }
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== auth.currentUser.uid);
      setUsers(usersData);
    } catch (error) {
      console.error('Error searching for partners:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUserCity) {
      searchPartners();
    }
    // eslint-disable-next-line
  }, [currentUserCity]);

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
            <div className="profile-city">{userProfile?.location || ''}</div>
          </div>
          <div className="profile-section-title">פרטים אישיים</div>
          <div className="profile-details">
            <div><span className="profile-label">רמת ניסיון:</span> {userProfile?.experienceLevel || userProfile?.experience || ''}</div>
            <div><span className="profile-label">מיקום:</span> {userProfile?.location || ''}</div>
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
          <h2 style={{margin: 0}}>חיפוש שותפים</h2>
        </div>
        <div className="filters-section" style={{marginBottom: '2rem'}}>
          <div className="filters">
            <div className="filter-group">
              <label>סוג אימון</label>
              <select name="workoutType" value={filters.workoutType} onChange={handleFilterChange}>
                <option value="">הכל</option>
                {workoutTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>רמת ניסיון</label>
              <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange}>
                <option value="">הכל</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>טווח (ק"מ)</label>
              <select name="distance" value={filters.distance} onChange={handleFilterChange}>
                {distanceOptions.map(km => (
                  <option key={km} value={km}>{km} ק"מ</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>זמן מועדף</label>
              <select name="timeSlot" value={filters.timeSlot} onChange={handleFilterChange}>
                <option value="">הכל</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <button onClick={searchPartners} className="search-button">
              חפש שותפים
            </button>
          </div>
        </div>
        <div className="results-section">
          {loading ? (
            <div className="loading">מחפש שותפים...</div>
          ) : (
            <div className="users-grid">
              {users.length === 0 ? (
                <div className="no-results">לא נמצאו שותפים בעיר שלך</div>
              ) : (
                users.map(user => (
                  <div key={user.id} className="post-card user-card">
                    <div className="post-header">
                      <div className="post-avatar">
                        <img
                          src={user.profilePicture || 'https://via.placeholder.com/150'}
                          alt={user.name}
                          className="user-avatar"
                        />
                      </div>
                      <div className="post-user-info">
                        <div className="post-user-name">{user.name}</div>
                        <div className="post-time">{user.location}</div>
                      </div>
                    </div>
                    <div className="post-content">
                      <p><strong>ניסיון:</strong> {user.experienceLevel}</p>
                      <p><strong>אימונים:</strong> {(user.workoutTypes || []).join(', ')}</p>
                      <p><strong>זמנים:</strong> {(user.preferredTimes || []).join(', ')}</p>
                    </div>
                    <div className="post-actions">
                      <button className="connect-button post-action-btn">התחבר</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindPartners; 