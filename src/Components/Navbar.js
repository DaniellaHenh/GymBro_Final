import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

function Navbar({ currentUser, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser && currentUser._id) { // הנחה ש-ID של המשתמש נשמר ב-_id
        try {
          console.log(currentUser._id)
          const response = await axios.get(`http://localhost:5000/api/users/${currentUser._id}`);
          setProfile(response.data);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (currentUser && currentUser._id) {
        try {
          console.log('Fetching pending requests for user:', currentUser._id);
          
          // Get all groups where current user is the creator
          const groupsResponse = await axios.get(`http://localhost:5000/api/groups`);
          console.log('All groups:', groupsResponse.data);
          console.log('Current user ID:', currentUser._id);
          groupsResponse.data.forEach(group => {
            console.log('Group:', group.name, 'Owner:', group.createdBy);
          });
          
          const userGroups = groupsResponse.data.filter(group =>
            group.createdBy === currentUser._id ||
            group.createdBy?._id === currentUser._id ||
            group.createdBy?.toString() === currentUser._id
          );
          console.log('User groups:', userGroups);
          
          // Get pending requests for all user's groups
          let allRequests = [];
          for (const group of userGroups) {
            try {
              const requestsResponse = await axios.get(`http://localhost:5000/api/join-requests/pending/${group._id}`);
              console.log(`Requests for group ${group._id}:`, requestsResponse.data);
              allRequests = [...allRequests, ...requestsResponse.data.map(req => ({
                ...req,
                groupName: group.name,
                groupId: group._id
              }))];
            } catch (error) {
              console.error('Error fetching requests for group:', group._id, error);
            }
          }
          
          console.log('Total pending requests:', allRequests);
          setPendingRequests(allRequests);
        } catch (error) {
          console.error('Error fetching pending requests:', error);
        }
      }
    };

    fetchPendingRequests();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!currentUser || !currentUser._id) return;
      try {
        const res = await axios.get('http://localhost:5000/api/groups');
        const myGroups = (res.data || []).filter(group =>
          (group.members || []).map(m => typeof m === 'object' ? String(m._id) : String(m)).includes(String(currentUser._id))
        );
        setUserGroups(myGroups); // or setUserGroups(myGroups.map(g => g._id)) if you want just IDs
        console.log('User groups:', myGroups);
      } catch (err) {
        console.error('Error fetching user groups:', err);
      }
    };
    fetchUserGroups();
  }, [currentUser]);

  const handleNotificationClick = (groupId) => {
    setShowNotifications(false);
    navigate(`/group/${groupId}/requests`);
  };

 return (
  <nav className="navbar" dir="rtl">
    <div className="navbar-left">
      <Link to={currentUser ? "/feed" : "/"} className="navbar-brand">FitPartner</Link>
    </div>
    <div className="navbar-right">
      {currentUser && (
        <>
          <Link to="/feed" className="nav-link">דף הבית</Link>
          <Link to="/find-partners" className="nav-link">חיפוש שותפים</Link>
          <Link to="/search-users" className="nav-link">חיפוש משתמשים</Link>
          <Link to="/search-groups" className="nav-link">חיפוש קבוצות</Link>
          <Link to="/profile" className="nav-link">עריכת פרופיל</Link>
          <Link to="/create-group" className="nav-link">צור קבוצה</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
     
      {/* Notification Icon - Show for testing even with 0 requests */}
      <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {pendingRequests.length > 0 && (
              <span className="notification-badge">{pendingRequests.length}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>בקשות הצטרפות ממתינות ({pendingRequests.length})</h4>
                <button 
                  className="close-notifications"
                  onClick={() => setShowNotifications(false)}
                >
                  ✕
                </button>
              </div>
              <div className="notification-list">
                {pendingRequests.length === 0 ? (
                  <div className="notification-item">
                    <div className="notification-content">
                      <span>אין בקשות הצטרפות ממתינות</span>
                    </div>
                  </div>
                ) : (
                  pendingRequests.map((request, index) => (
                    <div 
                      key={`${request._id}-${index}`} 
                      className="notification-item"
                      onClick={() => handleNotificationClick(request.groupId)}
                    >
                      <div className="notification-content">
                        <strong>{request.userId.firstName} {request.userId.lastName}</strong>
                        <span>רוצה להצטרף לקבוצה: {request.groupName}</span>
                        {request.message && (
                          <span className="notification-message">"{request.message}"</span>
                        )}
                      </div>
                      <div className="notification-time">
                        {new Date(request.createdAt).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
           </>
      )}
      {profile && (
        <div className="navbar-user">
          {profile.profilePicture ? (
            <img src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `http://localhost:5000${profile.profilePicture}`} alt={profile.name || profile.firstName} className="navbar-avatar" />
          ) : (
            <img src="/default-avatar.png" alt="avatar" className="navbar-avatar" />
          )}
          <span className="navbar-username">{profile.name || profile.firstName || 'משתמש'}</span>
        </div>
      )
      }
      {currentUser && (
        <button onClick={onLogout} className="logout-button">התנתק</button>
      )}
    </div>
    
  </nav>
);

}

export default Navbar;
