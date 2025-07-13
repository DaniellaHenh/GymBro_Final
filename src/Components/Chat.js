import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Chat.css';

function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data.filter(u => u._id !== currentUser._id));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [currentUser?._id]);

  // Fetch messages when a user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        setMessages([]); // Clear messages immediately on user change
        console.log('Fetching messages between:', currentUser._id, 'and', selectedUser._id);
        try {
          const response = await axios.get(`http://localhost:5000/api/messages?user1=${currentUser._id}&user2=${selectedUser._id}`);
          console.log('Fetched messages:', response.data);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    console.log('Sending message from', currentUser._id, 'to', selectedUser._id);
    try {
      const response = await axios.post('http://localhost:5000/api/messages', {
        sender: currentUser._id,
        receiver: selectedUser._id,
        text: newMessage
      });
      console.log('Message sent successfully:', response.data);
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Auto-refresh messages every 5 seconds when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages?user1=${currentUser._id}&user2=${selectedUser._id}`);
        console.log('Auto-refresh messages:', response.data);
        setMessages(response.data);
      } catch (error) {
        console.error('Error auto-refreshing messages:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedUser, currentUser._id]);

  return (
    <div className="chat-container" dir="rtl">
      <div className="chat-users-card">
        <div className="chat-users-title">משתמשים</div>
        <ul className="chat-users-list">
          {users.map(user => (
            <li
              key={user._id}
              className={`chat-user-item${selectedUser && selectedUser._id === user._id ? ' selected' : ''}`}
              onClick={() => {
                setSelectedUser(user);
                setMessages([]); // Clear messages immediately
              }}
            >
              {user.firstName} {user.lastName}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">צ'אט עם {selectedUser.firstName} {selectedUser.lastName}</div>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message${msg.sender === currentUser._id ? ' right' : ' left'}`}
                >
                  <span className="chat-bubble">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="chat-input"
                placeholder="הקלד הודעה..."
              />
              <button type="submit" className="chat-send-btn">שלח</button>
            </form>
          </>
        ) : (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>בחר משתמש כדי להתחיל צ'אט</div>
        )}
      </div>
    </div>
  );
}

export default Chat; 