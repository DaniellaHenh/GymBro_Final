import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Navbar.css';

function Navbar({ currentUser, onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data());
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
        <Link to="/feed" className="nav-link">דף הבית</Link>
        <Link to="/find-partners" className="nav-link">חיפוש שותפים</Link>
        <Link to="/profile" className="nav-link">פרופיל</Link>
        {profile && (
          <div className="navbar-user">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.name || profile.firstName} className="navbar-avatar" />
            ) : (
              <div className="navbar-avatar avatar-placeholder" />
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