import React from 'react';
import './Profile.css';

function Profile({ user }) {
  return (
    <div className="profile">
      <div className="profile-header">
        <img src={user?.avatar} alt={user?.name} className="profile-avatar" />
        <h2>{user?.name}</h2>
        <p className="profile-email">{user?.email}</p>
      </div>
      <div className="profile-stats">
        <div className="stat">
          <span className="stat-number">0</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat">
          <span className="stat-number">0</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat">
          <span className="stat-number">0</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    </div>
  );
}

export default Profile; 