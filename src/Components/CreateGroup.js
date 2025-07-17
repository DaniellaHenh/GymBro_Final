import React, { useState } from 'react';
import './CreateGroup.css';
import axios from 'axios';

const CreateGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');


const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const createdBy = user?._id;
      
      await axios.post('http://localhost:5000/api/groups', {
        name,
        description,
        createdBy
      });

      setSuccess(true);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create group');
    }
  };


  return (
    <div className="create-group-container" dir="rtl">
      <div className="create-group-box">
        <h2 className="create-group-title">צור קבוצה</h2>
        {success && <div className="success-message">הקבוצה נוצרה בהצלחה!</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="group-name">שם קבוצה</label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="הכנס שם קבוצה"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="group-description">תיאור</label>
            <textarea
              id="group-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="הכנס תיאור (לא חובה)"
              rows={3}
              style={{ maxWidth: '370px', margin: '0 auto', display: 'block' }}

            />
          </div>
          <button type="submit" className="create-group-button">צור</button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup; 