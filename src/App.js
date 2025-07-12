import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Feed from './Components/Feed';
import UserProfile from './Components/UserProfile';
import FindPartners from './Components/FindPartners';

import SearchUsers from './Components/SearchUsers';
import './App.css';
import HomePage from './Components/HomePage';

import CreateGroup from './Components/CreateGroup';
import GroupFeed from './Components/GroupFeed';
import Chat from './Components/Chat';


function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // נטען את המשתמש מתוך localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.location.href = '/login'; // רענון כפוי לדף התחברות
  };

  return (
    <Router>
      <div className="App">
        {currentUser && <Navbar currentUser={currentUser} onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Navigate to="/feed" /> : <HomePage />}
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
          <Route
            path="/profile/:userId"
            element={currentUser ? <UserProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/find-partners"
            element={currentUser ? <FindPartners /> : <Navigate to="/login" />}
          />
          <Route
            path="/search-users"
            element={currentUser ? <SearchUsers /> : <Navigate to="/login" />}
          />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/group/:groupId" element={<GroupFeed />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
