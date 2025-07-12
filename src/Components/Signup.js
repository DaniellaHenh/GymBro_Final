import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import Navbar from './Navbar';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    workoutTypes: [],
    availableTimes: [],
    termsAgreed: false
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const workoutTypes = ['הרמת משקולות', 'ריצה', 'יוגה', 'קרוספיט', 'שחייה', 'אופניים', 'HIIT', 'פילאטיס'];
  const timeSlots = ['בוקר (6-9)', 'בוקר מאוחר (9-12)', 'צהריים (12-15)', 'אחר הצהריים (15-18)', 'ערב (18-21)', 'לילה (21-00)'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (!formData.termsAgreed) {
      setError('יש לאשר את תנאי השימוש');
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        workoutTypes: formData.workoutTypes,
        availableTimes: formData.availableTimes,
        createdAt: new Date(),
      };

      const response = await axios.post('http://localhost:5000/api/users', {
        command: 'insert',
        data: userData
      });

      console.log('המשתמש נוצר בהצלחה', response.data);
      navigate('/feed');
    } catch (error) {
      console.error('שגיאה ביצירת משתמש:', error);
      setError(error.response?.data?.message || 'שגיאת שרת');
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-container" dir="rtl">
        <div className="signup-box">
          <h2>הרשמה</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSignup}>
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="שם פרטי" required />
              </div>
              <div className="form-group">
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="שם משפחה" required />
              </div>
            </div>

            <div className="form-group">
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="אימייל" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="סיסמה" required />
              </div>
              <div className="form-group">
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="אימות סיסמה" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="טלפון" required />
              </div>
              <div className="form-group">
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="עיר" required />
              </div>
            </div>

            <div className="form-group">
              <label>סוגי אימון</label>
              <div className="checkbox-group">
                {workoutTypes.map(type => (
                  <label key={type} className="checkbox-label">
                    <input type="checkbox" checked={formData.workoutTypes.includes(type)} onChange={() => handleCheckboxChange('workoutTypes', type)} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>זמני אימון</label>
              <div className="checkbox-group">
                {timeSlots.map(time => (
                  <label key={time} className="checkbox-label">
                    <input type="checkbox" checked={formData.availableTimes.includes(time)} onChange={() => handleCheckboxChange('availableTimes', time)} />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" name="termsAgreed" checked={formData.termsAgreed} onChange={handleInputChange} />
                אני מאשר/ת את תנאי השימוש
              </label>
            </div>

            <button type="submit" className="signup-button">הרשמה</button>
          </form>
          <p className="login-link">
            כבר יש לך חשבון? <span onClick={() => navigate('/login')}>התחבר</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
