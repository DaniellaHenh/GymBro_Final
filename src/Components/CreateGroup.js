import React, { useState } from 'react';
import './CreateGroup.css';

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
      const res = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, createdBy })
      });
      if (!res.ok) throw new Error('Failed to create group');
      setSuccess(true);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message);
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
            />
          </div>
          <button type="submit" className="create-group-button">צור</button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup; 