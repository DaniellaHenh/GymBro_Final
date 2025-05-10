import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/feed');
    } catch (error) {
      setError('פרטי ההתחברות שגויים');
    }
  };

  return (
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
  );
}

export default Login; 