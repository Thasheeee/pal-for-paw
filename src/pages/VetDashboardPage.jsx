import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Calendar as CalendarIcon,
  ClipboardList
} from 'lucide-react';

const VetDashboardPage = ({ appointments, setAppointments, user, role }) => {
  const [filter, setFilter] = useState('all');

  // --- 1. HANDLE STATUS UPDATE (Atlas Integration) ---
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the global state in App.jsx so all pages stay in sync
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? { ...apt, status: newStatus } : apt)
        );
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating status in MongoDB Atlas:", error);
      alert("Failed to connect to the server.");
    }
  };

  // Filter logic for the UI
  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' ? true : apt.status === filter
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1><ClipboardList size={36} /> Veterinarian Dashboard</h1>
        <p>Manage your upcoming appointments and patient requests</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <Clock className="stat-icon pending" />
          <div className="stat-info">
            <span className="stat-value">{appointments.filter(a => a.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon accepted" />
          <div className="stat-info">
            <span className="stat-value">{appointments.filter(a => a.status === 'accepted').length}</span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`tab ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>Accepted</button>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found for this category.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div key={apt._id} className={`appointment-card ${apt.status}`}>
              <div className="apt-header">
                <h3>{apt.dogName}</h3>
                <span className={`status-badge ${apt.status}`}>{apt.status.toUpperCase()}</span>
              </div>
              
              <div className="apt-details">
                <div className="detail-item">
                  <User size={16} /> <span>Owner: {apt.ownerName}</span>
                </div>
                <div className="detail-item">
                  <Phone size={16} /> <span>Contact: {apt.contact}</span>
                </div>
                <div className="detail-item">
                  <CalendarIcon size={16} /> <span>Date: {apt.date} at {apt.time}</span>
                </div>
              </div>

              {apt.notes && (
                <div className="apt-notes">
                  <strong>Notes:</strong> {apt.notes}
                </div>
              )}

              {apt.status === 'pending' && (
                <div className="apt-actions">
                  <button 
                    className="btn-accept" 
                    onClick={() => handleStatusUpdate(apt._id, 'accepted')}
                  >
                    <CheckCircle size={18} /> Accept
                  </button>
                  <button 
                    className="btn-reject" 
                    onClick={() => handleStatusUpdate(apt._id, 'rejected')}
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VetDashboardPage;