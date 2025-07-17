import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GroupRequests.css';
import axios from 'axios';

function GroupRequests() {
  const { groupId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroupDetails();
    fetchPendingRequests();
  }, [groupId]);


  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`/api/groups/${groupId}`);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };


  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/join-requests/pending/${groupId}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`/api/join-requests/approve/${requestId}`);
      
      // Remove the approved request from the list
      setRequests(requests.filter(req => req._id !== requestId));
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      const message = error.response?.data?.error || 'Error approving request';
      alert(`Error: ${message}`);
    }
  };


  const handleReject = async (requestId) => {
    try {
      await axios.put(`/api/join-requests/reject/${requestId}`);

      // Remove the rejected request from the list
      setRequests(requests.filter(req => req._id !== requestId));
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      const message = error.response?.data?.error || 'Error rejecting request';
      alert(`Error: ${message}`);
    }
  };


  if (loading) {
    return <div className="requests-loading">טוען בקשות הצטרפות...</div>;
  }

  return (
    <div className="group-requests-container">
      <div className="requests-header">
        <button 
          className="back-btn"
          onClick={() => navigate(`/group/${groupId}`)}
        >
          ← חזור לקבוצה
        </button>
        <h2 className="requests-title">
          בקשות הצטרפות לקבוצה: {group?.name || 'טוען...'}
        </h2>
      </div>
      
      {requests.length === 0 ? (
        <div className="no-requests">אין בקשות הצטרפות ממתינות</div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request._id} className="request-item">
              <div className="request-user-info">
                <h3>{request.userId.firstName} {request.userId.lastName}</h3>
                <p className="request-email">{request.userId.email}</p>
                {request.message && (
                  <p className="request-message">הודעה: {request.message}</p>
                )}
                <p className="request-date">
                  תאריך בקשה: {new Date(request.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>
              
              <div className="request-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(request._id)}
                >
                  אישור
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleReject(request._id)}
                >
                  דחייה
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupRequests; 