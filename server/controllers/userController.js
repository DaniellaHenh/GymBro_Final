import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './UserProfile.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

function UserProfile() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
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
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const originalProfile = useRef(null);
  const fileInputRef = useRef();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const workoutTypes = ['Strength Training', 'Running', 'Yoga', 'CrossFit', 'Swimming', 'Cycling', 'HIIT', 'Pilates'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const timeSlots = ['Morning (6-9)', 'Late Morning (9-12)', 'Afternoon (12-3)', 'Late Afternoon (3-6)', 'Evening (6-9)'];
  const equipmentOptions = ['Gym Equipment', 'Body Weight', 'Free Weights', 'Resistance Bands', 'Yoga Mat', 'Running Shoes'];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser || !currentUser._id) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/users/${currentUser._id}`);
        const data = res.data;

        const normalized = {
          name: data.name || '',
          location: data.location || '',
          age: data.age || '',
          gender: data.gender || '',
          workoutTypes: data.workoutTypes || [],
          experienceLevel: data.experienceLevel || '',
          preferredTimes: data.preferredTimes || [],
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
        setPreviewImage(normalized.profilePicture || '');
      } catch (err) {
        console.error('שגיאה בטעינת פרופיל:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageSelectAndUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?._id) return;

    setUploading(true);
    try {
      const imageRef = ref(storage, `profilePictures/${currentUser._id}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setProfile(prev => ({ ...prev, profilePicture: url }));
      setPreviewImage(url);
      alert('התמונה הועלתה בהצלחה!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?._id) return;

    const isChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile.current);
    if (!isChanged) {
      alert('לא בוצעו שינויים בפרופיל');
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/users/${currentUser._id}`, profile);
      originalProfile.current = profile;
      alert('הפרופיל עודכן בהצלחה!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('שגיאה בעדכון הפרופיל');
    }
  };

  if (loading) return <div className="loading">טוען פרופיל...</div>;

  return (
    <div className="profile-dashboard" dir="rtl">
      <div className="profile-card editable-profile-card">
        <form onSubmit={handleSubmit}>
          <div className="profile-avatar-edit-section">
            <div className="profile-avatar">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-picture" />
              ) : (
                <div className="avatar-placeholder"><span>הוסף תמונה</span></div>
              )}
            </div>
            <div className="image-upload-controls">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageSelectAndUpload}
                accept="image/*"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {profile.profilePicture ? 'עדכן תמונה' : 'העלה תמונה'}
              </button>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label>שם</label>
              <input name="name" value={profile.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>עיר</label>
              <input name="location" value={profile.location} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>גיל</label>
              <input type="number" name="age" value={profile.age} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>מין</label>
              <select name="gender" value={profile.gender} onChange={handleInputChange} required>
                <option value="">בחר</option>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div className="form-group">
              <label>רמת ניסיון</label>
              <select name="experienceLevel" value={profile.experienceLevel} onChange={handleInputChange} required>
                <option value="">בחר</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level.toLowerCase()}>{level}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>סוגי אימון</label>
              <div className="checkbox-group">
                {workoutTypes.map(type => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={profile.workoutTypes.includes(type)}
                      onChange={() => handleCheckboxChange('workoutTypes', type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>שעות אימון מועדפות</label>
              <div className="checkbox-group">
                {timeSlots.map(time => (
                  <label key={time}>
                    <input
                      type="checkbox"
                      checked={profile.preferredTimes.includes(time)}
                      onChange={() => handleCheckboxChange('preferredTimes', time)}
                    />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>ציוד זמין</label>
              <div className="checkbox-group">
                {equipmentOptions.map(equipment => (
                  <label key={equipment}>
                    <input
                      type="checkbox"
                      checked={profile.equipment.includes(equipment)}
                      onChange={() => handleCheckboxChange('equipment', equipment)}
                    />
                    {equipment}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>תיאור</label>
              <textarea name="description" value={profile.description} onChange={handleInputChange} rows="3" />
            </div>

            <div className="form-group">
              <label>מטרות אימון</label>
              <textarea name="workoutGoals" value={profile.workoutGoals} onChange={handleInputChange} rows="2" />
            </div>
          </div>

          <button type="submit" className="save-button">שמור פרופיל</button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
