import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

function Navbar({ currentUser, onLogout }) {
  const [profile, setProfile] = useState(null);

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
          <Link to="/profile" className="nav-link">פרופיל</Link>
          <Link to="/create-group" className="nav-link">צור קבוצה</Link>
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
      )}

      {currentUser && (
        <button onClick={onLogout} className="logout-button">התנתק</button>
      )}
    </div>
  </nav>
);

}

export default Navbar;
