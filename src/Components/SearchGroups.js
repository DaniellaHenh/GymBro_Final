import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchGroups.css';

const SearchGroups = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingGroupRequests, setPendingGroupRequests] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch all groups on component mount
  useEffect(() => {
    fetchAllGroups();
  }, []);

  const fetchAllGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups');
      setAllGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const searchGroups = async (query) => {
    if (!query.trim()) {
      setGroups([]);
      return;
    }

    setLoading(true);
    console.log('Searching for groups with query:', query);
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/groups/search?query=${encodeURIComponent(query)}`
      );
      
      console.log('Search response:', response.data);
      
      if (response.data && response.data.groups) {
        setGroups(response.data.groups);
        console.log('Found groups:', response.data.groups.length);
      } else {
        setGroups([]);
        console.log('No groups found in response');
      }
    } catch (error) {
      console.error('Error searching groups:', error);
      console.error('Error response:', error.response?.data);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchGroups(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allGroups]);

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };


  const handleJoinRequest = async (groupId, creatorId) => {
    if (!currentUser || pendingGroupRequests.includes(groupId)) {
      alert('כבר שלחת בקשה לקבוצה הזו או שאין משתמש מחובר');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/join-requests/request', {
        groupId,
        userId: currentUser._id,
        message: 'בקשת הצטרפות לקבוצה'
      });

      if (res.status === 201) {
        alert('בקשתך נשלחה!');
        // טען מחדש את כל הבקשות הממתינות
        const pendingRes = await axios.get(`http://localhost:5000/api/join-requests/user/${currentUser._id}`);
        const pending = (pendingRes.data || [])
          .filter(r => r.status === 'pending')
          .map(r => r.groupId._id || r.groupId);

        setPendingGroupRequests(pending);
      } else {
        alert('שגיאה בשליחת הבקשה');
      }
    } catch (err) {
      console.error('Error sending join request:', err);
      if (err.response?.status === 400) {
        alert(err.response.data.error || 'שגיאה בשליחת הבקשה');
      } else {
        alert('שגיאה בשליחת הבקשה');
      }
    }
  };



  const isUserInGroup = (group) => {
    if (!currentUser || !group.members) return false;
    return group.members.some(member => 
      (typeof member === 'string' && member === currentUser._id) ||
      (typeof member === 'object' && member._id === currentUser._id)
    );
  };

  return (
    <div className="search-groups-container" dir="rtl">
      <div className="search-groups-box">
        <h2 className="search-groups-title">חיפוש קבוצות</h2>
        
        <div className="search-input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לפי שם קבוצה, תיאור, קטגוריה, מיקום..."
            className="search-input"
          />
          {loading && <div className="search-loading">מחפש...</div>}
        </div>

        <div className="search-results">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group._id}
                className="group-card"
                onClick={() => handleGroupClick(group._id)}
              >
                <div className="group-header">
                  <div className="group-icon">👥</div>
                  <div className="group-info">
                    <div className="group-name">{group.name}</div>
                    {group.description && (
                      <div className="group-description">{group.description}</div>
                    )}
                    <div className="group-details">
                      {group.category && (
                        <span className="group-category">{group.category}</span>
                      )}
                      {group.location && (
                        <span className="group-location">📍 {group.location}</span>
                      )}
                      <span className="group-members-count">
                        {group.members ? group.members.length : 0} חברים
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="group-actions">
                  {isUserInGroup(group) ? (
                    <span className="member-badge">חבר בקבוצה</span>
                  ) : (
                    <button 
                      className="join-group-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRequest(group._id, group.createdBy);
                      }}
                    >
                      בקש להצטרף
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : searchQuery && !loading ? (
            <div className="no-results">לא נמצאו קבוצות</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SearchGroups; 