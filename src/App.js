import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Feed from './Components/Feed';
import UserProfile from './Components/UserProfile';
import FindPartners from './Components/FindPartners';
import './App.css';
import HomePage from './Components/HomePage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {currentUser && <Navbar currentUser={currentUser} onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Navigate to="/feed" /> :  <HomePage />}
          />
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/feed" /> : <Login />}
          />
          <Route
            path="/signup"
            element={currentUser ? <Navigate to="/feed" /> : <Signup />}
          />
          <Route
            path="/feed"
            element={currentUser ? <Feed /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={currentUser ? <UserProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/find-partners"
            element={currentUser ? <FindPartners /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
