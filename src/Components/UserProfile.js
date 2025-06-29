import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase';
import './UserProfile.css';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
  const [imageUpload, setImageUpload] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const originalProfile = useRef(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const workoutTypes = ['Strength Training', 'Running', 'Yoga', 'CrossFit', 'Swimming', 'Cycling', 'HIIT', 'Pilates'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const timeSlots = ['Morning (6-9)', 'Late Morning (9-12)', 'Afternoon (12-3)', 'Late Afternoon (3-6)', 'Evening (6-9)'];
  const fitnessLevels = ['Casual', 'Regular', 'Athlete', 'Professional'];
  const workoutFrequencies = ['1-2 times/week', '3-4 times/week', '5-6 times/week', 'Daily'];
  const equipmentOptions = ['Gym Equipment', 'Body Weight', 'Free Weights', 'Resistance Bands', 'Yoga Mat', 'Running Shoes'];

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${auth.currentUser._id}`);
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
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [auth.currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkoutTypeChange = (type) => {
    setProfile(prev => ({
      ...prev,
      workoutTypes: prev.workoutTypes.includes(type)
        ? prev.workoutTypes.filter(t => t !== type)
        : [...prev.workoutTypes, type]
    }));
  };

  const handleTimeSlotChange = (time) => {
    setProfile(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setProfile(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleImageSelectAndUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUpload(file);
    setPreviewImage(URL.createObjectURL(file));
    setUploading(true);
    try {
      const imageRef = ref(storage, `profilePictures/${auth.currentUser._id}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setProfile(prev => ({ ...prev, profilePicture: url }));
      setPreviewImage(url);
      // Update Firestore with new profilePicture URL
      const userRef = doc(db, 'users', auth.currentUser._id);
      await updateDoc(userRef, { profilePicture: url });
      alert('התמונה הועלתה בהצלחה!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('שגיאה בהעלאת התמונה');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile.current);
    if (!isChanged) {
      alert('לא בוצעו שינויים בפרופיל');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/users/${auth.currentUser._id}`, profile);
      originalProfile.current = profile;
      alert('הפרופיל עודכן בהצלחה!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('שגיאה בעדכון הפרופיל');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-dashboard" dir="rtl">
      <div className="profile-card editable-profile-card">
        <form onSubmit={handleSubmit}>
          <div className="profile-avatar-edit-section">
            <div className="profile-avatar">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-picture" />
              ) : (
                <div className="avatar-placeholder">
                  <span>הוסף תמונה</span>
                </div>
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
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={uploading}
              >
                {profile.profilePicture ? 'עדכן תמונה' : 'העלה תמונה'}
              </button>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label>שם</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>עיר</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>גיל</label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleInputChange}
                required
              />
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
                  <option key={level} value={level.toLowerCase()}>{level === 'Beginner' ? 'מתחיל' : level === 'Intermediate' ? 'בינוני' : 'מתקדם'}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>סוגי אימון</label>
              <div className="checkbox-group">
                {workoutTypes.map(type => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.workoutTypes.includes(type)}
                      onChange={() => handleWorkoutTypeChange(type)}
                    />
                    {type === 'Strength Training' ? 'אימון כוח' :
                     type === 'Running' ? 'ריצה' :
                     type === 'Yoga' ? 'יוגה' :
                     type === 'CrossFit' ? 'קרוספיט' :
                     type === 'Swimming' ? 'שחייה' :
                     type === 'Cycling' ? 'אופניים' :
                     type === 'HIIT' ? 'אימון אינטרוולים' :
                     type === 'Pilates' ? 'פילאטיס' : type}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>שעות אימון מועדפות</label>
              <div className="checkbox-group">
                {timeSlots.map(time => (
                  <label key={time} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.preferredTimes.includes(time)}
                      onChange={() => handleTimeSlotChange(time)}
                    />
                    {time === 'Morning (6-9)' ? 'בוקר (6-9)' :
                     time === 'Late Morning (9-12)' ? 'בוקר מאוחר (9-12)' :
                     time === 'Afternoon (12-3)' ? 'צהריים (12-3)' :
                     time === 'Late Afternoon (3-6)' ? 'אחר הצהריים (3-6)' :
                     time === 'Evening (6-9)' ? 'ערב (6-9)' : time}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>ציוד זמין</label>
              <div className="checkbox-group">
                {equipmentOptions.map(equipment => (
                  <label key={equipment} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.equipment.includes(equipment)}
                      onChange={() => handleEquipmentChange(equipment)}
                    />
                    {equipment === 'Gym Equipment' ? 'ציוד חדר כושר' :
                     equipment === 'Body Weight' ? 'משקל גוף' :
                     equipment === 'Free Weights' ? 'משקולות חופשיים' :
                     equipment === 'Resistance Bands' ? 'גומיות התנגדות' :
                     equipment === 'Yoga Mat' ? 'מזרן יוגה' :
                     equipment === 'Running Shoes' ? 'נעלי ריצה' : equipment}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>תיאור</label>
              <textarea
                name="description"
                value={profile.description}
                onChange={handleInputChange}
                placeholder="ספר על עצמך ועל מסע הכושר שלך"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>מטרות אימון</label>
              <textarea
                name="workoutGoals"
                value={profile.workoutGoals}
                onChange={handleInputChange}
                placeholder="מהן מטרות הכושר שלך?"
                rows="2"
              />
            </div>
          </div>
          <button type="submit" className="save-button">שמור פרופיל</button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile; 