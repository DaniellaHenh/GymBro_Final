import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Navbar from './Navbar';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5000/api/users', {
        command: 'login',
        data: { email, password }
      });
  
      console.log('Login response:', response.data);
  
      if (response.data.user) {
        console.log('user before saving to localStorage:', response.data.user);

        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/feed';
      } else {
        throw new Error('User data missing in response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'פרטי ההתחברות שגויים');
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="login-container" dir="rtl">
        <div className="login-box">
          <h2 className="login-title">התחברות</h2>
          <p className="login-subtitle">הזן את פרטי ההתחברות שלך כדי להיכנס לחשבונך</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">אימייל</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">סיסמה</label>
              <input
                id="password"
                type="password"
                placeholder="סיסמה?"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">התחבר</button>
          </form>
          <p className="signup-link">
            אין לך חשבון? <span onClick={() => navigate('/signup')}>הרשם עכשיו</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
