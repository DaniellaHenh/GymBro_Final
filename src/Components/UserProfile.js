import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './UserProfile.css';

function UserProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    city: '',
    workoutTypes: [],
    experienceLevel: '',
    preferredTimes: [],
    bio: '',
    profilePicture: '',
    description: '',
    workoutGoals: '',
    fitnessLevel: '',
    favoriteExercises: [],
    workoutFrequency: '',
    equipment: []
  });

  const [loading, setLoading] = useState(true);
  const originalProfile = useRef(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser._id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${currentUser._id}`);
        const data = res.data;

        const normalized = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          city: data.city || '',
          age: data.age || '',
          gender: data.gender || '',
          workoutTypes: data.workoutTypes || [],
          experienceLevel: data.experienceLevel || '',
          preferredTimes: data.availableTimes || [],
          equipment: data.equipment || [],
          profilePicture: data.profilePicture || '',
          description: data.description || '',
          workoutGoals: data.workoutGoals || '',
          fitnessLevel: data.fitnessLevel || '',
          favoriteExercises: data.favoriteExercises || [],
          workoutFrequency: data.workoutFrequency || '',
          bio: data.bio || ''
        };

        setProfile(normalized);
        originalProfile.current = normalized;
      } catch (err) {
        console.error('Error loading profile:', err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setProfile(prev => {
      const currentArray = prev[field] || [];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setUploadingPic(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const res = await axios.post(`http://localhost:5000/api/users/upload-profile-picture/${currentUser._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, profilePicture: res.data.user.profilePicture }));
      setUploadingPic(false);
      alert('תמונת פרופיל עודכנה בהצלחה!');
    } catch (err) {
      setUploadingPic(false);
      alert('שגיאה בהעלאת תמונת פרופיל');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser._id) {
      alert('משתמש לא מחובר');
      return;
    }
    const isChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile.current);
    if (!isChanged) {
      alert('לא בוצעו שינויים בפרופיל');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/users/${currentUser._id}`, profile);
      originalProfile.current = profile;
      alert('הפרופיל עודכן בהצלחה!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('שגיאה בעדכון הפרופיל');
    }
  };

  const workoutTypesOptions = ['הרמת משקולות', 'ריצה', 'יוגה', 'קרוספיט', 'שחייה', 'אופניים', 'HIIT', 'פילאטיס'];
  const experienceLevelsOptions = ['מתחיל', 'בינוני', 'מתקדם'];
  const preferredTimesOptions = ['בוקר (6-9)', 'בוקר מאוחר (9-12)', 'צהריים (12-15)', 'אחר הצהריים (15-18)', 'ערב (18-21)', 'לילה (21-00)'];
  const equipmentOptions = ['ציוד חדר כושר', 'משקל גוף', 'משקולות חופשיים', 'גומיות התנגדות', 'מזרן יוגה', 'נעלי ריצה'];

  if (loading) return <div>טוען פרופיל...</div>;

 return (
    <div className="profile-page" dir="rtl">
      <div className="profile-dashboard">
        <div className="profile-card editable-profile-card">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>עריכת פרופיל</h2>
          <form onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              {/* Profile Picture Upload */}
              <div className="form-group full-width" style={{ textAlign: 'center' }}>
                <label>תמונת פרופיל</label>
                <div style={{ marginBottom: '10px' }}>
                  {profile.profilePicture ? (
                    <img
                      src={`http://localhost:5000${profile.profilePicture}`}
                      alt="Profile"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4e8c85' }}
                    />
                  ) : (
                    <img
                      src="/default-avatar.png"
                      alt="No profile"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }}
                    />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  disabled={uploadingPic}
                  style={{ margin: '0 auto', display: 'block' }}
                />
                {uploadingPic && <div style={{ color: '#4e8c85', marginTop: 4 }}>מעלה תמונה...</div>}
              </div>
              <div className="form-group">
                <label>שם פרטי</label>
                <input type="text" name="firstName" value={profile.firstName} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>שם משפחה</label>
                <input type="text" name="lastName" value={profile.lastName} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>עיר</label>
                <input type="text" name="city" value={profile.city} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>גיל</label>
                <input type="number" name="age" value={profile.age || ''} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>מין</label>
                <select name="gender" value={profile.gender || ''} onChange={handleInputChange}>
                  <option value="">בחר</option>
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              <div className="form-group">
                <label>רמת ניסיון</label>
                <select name="experienceLevel" value={profile.experienceLevel || ''} onChange={handleInputChange}>
                  <option value="">בחר</option>
                  {experienceLevelsOptions.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>סוגי אימון</label>
                <div className="checkbox-group">
                  {workoutTypesOptions.map(type => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={profile.workoutTypes?.includes(type) || false}
                        onChange={() => handleCheckboxChange('workoutTypes', type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>שעות אימון מועדפות</label>
                <div className="checkbox-group">
                  {preferredTimesOptions.map(time => (
                    <label key={time} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={profile.preferredTimes?.includes(time) || false}
                        onChange={() => handleCheckboxChange('preferredTimes', time)}
                      />
                      <span>{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>ציוד זמין</label>
                <div className="checkbox-group">
                  {equipmentOptions.map(eq => (
                    <label key={eq} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={profile.equipment?.includes(eq) || false}
                        onChange={() => handleCheckboxChange('equipment', eq)}
                      />
                      <span>{eq}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>תיאור</label>
                <textarea name="description" value={profile.description || ''} onChange={handleInputChange} rows="3" />
              </div>

              <div className="form-group full-width">
                <label>מטרות אימון</label>
                <textarea name="workoutGoals" value={profile.workoutGoals || ''} onChange={handleInputChange} rows="2" />
              </div>
            </div>

            <button type="submit" className="save-button">שמור פרופיל</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

