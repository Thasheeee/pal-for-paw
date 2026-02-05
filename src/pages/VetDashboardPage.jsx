import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  History,
  ClipboardList
} from 'lucide-react';

const VetDashboardPage = ({ 
  user, 
  role, 
  navigateTo, 
  appointments, 
  setAppointments 
}) => {
  // Toggle between 'requests' and 'history' views
  const [activeTab, setActiveTab] = useState('requests');

  // HANDLE STATUS UPDATE (MongoDB Atlas Integration) 
  const handleStatusUpdate = async (appointmentId, newStatus, responseText) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          response: responseText 
        }),
      });

      if (response.ok) {
        alert(`Success! Appointment has been ${newStatus}.`);
        
        // Update global state to reflect changes across the app
        setAppointments(prev => {
          const currentApts = Array.isArray(prev) ? prev : [];
          return currentApts.map(apt => 
            apt._id === appointmentId ? { ...apt, status: newStatus, response: responseText } : apt
          );
        });
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to connect to the server.");
    }
  };

  const handleAccept = (id) => {
    handleStatusUpdate(id, 'accepted', 'Your appointment has been confirmed by the veterinarian.');
  };

  const handleReject = (id) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason !== null) {
      handleStatusUpdate(id, 'rejected', reason || 'Appointment was declined due to schedule constraints.');
    }
  };

  // DATA FILTERING 
  // Ensure appointments is always an array to prevent .map() crashes
  const allAppointments = Array.isArray(appointments) ? appointments : [];
  const pendingRequests = allAppointments.filter(apt => apt.status === 'pending');
  const historyLog = allAppointments.filter(apt => apt.status !== 'pending');

  // ACCESS PROTECTION 
  if (!user || role !== 'vet') {
    return (
      <div className="page">
        <div className="restriction-message">
          <AlertCircle size={64} />
          <h2>Access Restricted</h2>
          <p>This page is only accessible to veterinarians</p>
          <button className="btn-primary" onClick={() => navigateTo('login')}>
            Login as Veterinarian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><ClipboardList size={36} /> Veterinarian Dashboard</h1>
        <p>Manage your clinical schedule and patient requests</p>
      </div>

      {/* View Toggle Tabs */}
      <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <button 
          className={`btn-primary ${activeTab === 'requests' ? '' : 'btn-outline'}`}
          onClick={() => setActiveTab('requests')}
        >
          <Bell size={18} /> New Requests ({pendingRequests.length})
        </button>
        <button 
          className={`btn-primary ${activeTab === 'history' ? '' : 'btn-outline'}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} /> Appointment History
        </button>
      </div>

      <div className="vet-dashboard">
        {activeTab === 'requests' ? (
          /* PENDING REQUESTS VIEW */
          pendingRequests.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={64} color="var(--success)" />
              <h3>All Caught Up!</h3>
              <p>No pending appointment requests at the moment.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {pendingRequests.map((appointment) => (
                <div key={appointment._id} className="appointment-card vet-card">
                  <div className="appointment-header">
                    <div>
                      <h3>{appointment.dogName}</h3>
                      <p className="appointment-owner">Owner: {appointment.ownerName}</p>
                    </div>
                    <div className="status-badge pending">PENDING</div>
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-detail"><Calendar size={16} /> {appointment.date}</div>
                    <div className="appointment-detail"><Clock size={16} /> {appointment.time}</div>
                    <div className="appointment-detail"><Phone size={16} /> {appointment.contact}</div>
                    <div className="appointment-detail"><Mail size={16} /> {appointment.email}</div>
                  </div>
                  {appointment.notes && (
                    <div className="appointment-notes">
                      <strong>Patient Notes:</strong> {appointment.notes}
                    </div>
                  )}
                  <div className="appointment-actions">
                    <button className="btn-success" onClick={() => handleAccept(appointment._id)}>
                      <CheckCircle size={18} /> Accept
                    </button>
                    <button className="btn-danger" onClick={() => handleReject(appointment._id)}>
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* HISTORY LOG VIEW */
          historyLog.length === 0 ? (
            <div className="empty-state">
              <History size={64} />
              <h3>No History Yet</h3>
              <p>Processed appointments will appear here.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {historyLog.map((appointment) => (
                <div key={appointment._id} className={`appointment-card ${appointment.status}`}>
                  <div className="appointment-header">
                    <div>
                      <h3>{appointment.dogName}</h3>
                      <p className="appointment-owner">Owner: {appointment.ownerName}</p>
                    </div>
                    <div className={`status-badge ${appointment.status}`}>
                      {appointment.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-detail"><Calendar size={16} /> {appointment.date}</div>
                    <div className="appointment-detail"><Clock size={16} /> {appointment.time}</div>
                  </div>
                  <div className="vet-response" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '12px' }}>
                    <strong>Your Response:</strong> {appointment.response}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VetDashboardPage;