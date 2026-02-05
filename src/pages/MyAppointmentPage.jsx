import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  History, 
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';

const MyAppointmentPage = ({ user, role, userAppointments, navigateTo }) => {
  const [filter, setFilter] = useState('all');

  // ACCESS PROTECTION 
  if (!user) {
    return (
      <div className="page">
        <div className="restriction-message">
          <AlertCircle size={64} />
          <h2>Please Login</h2>
          <p>You need to be logged in to view your appointment history.</p>
          <button className="btn-primary" onClick={() => navigateTo('login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  //  DATA SORTING & FILTERING 
  // Ensure we are working with an array
  const appointments = Array.isArray(userAppointments) ? userAppointments : [];
  
  // Sort by date (newest first)
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const filteredApts = sortedAppointments.filter(apt => 
    filter === 'all' ? true : apt.status === filter
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1><ClipboardCheck size={36} /> My Appointments</h1>
        <p>Track your scheduled visits and veterinarian feedback</p>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <button 
          className={`btn-primary ${filter === 'all' ? '' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`btn-primary ${filter === 'accepted' ? '' : 'btn-outline'}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted
        </button>
        <button 
          className={`btn-primary ${filter === 'pending' ? '' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>

      <div className="appointments-container">
        {filteredApts.length === 0 ? (
          <div className="empty-state">
            <History size={64} />
            <h3>No Appointments Found</h3>
            <p>You haven't booked any sessions yet or no records match your filter.</p>
            {role !== 'vet' && (
              <button className="btn-primary" onClick={() => navigateTo('booking')}>
                Book a Vet Now
              </button>
            )}
          </div>
        ) : (
          <div className="appointments-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {filteredApts.map((apt) => (
              <div key={apt._id} className={`appointment-card ${apt.status}`} style={{ position: 'relative' }}>
                <div className="appointment-header">
                  <div>
                    <h3>{apt.dogName}</h3>
                    <div className={`status-badge ${apt.status}`}>
                      {apt.status === 'accepted' && <CheckCircle size={14} />}
                      {apt.status === 'rejected' && <XCircle size={14} />}
                      {apt.status === 'pending' && <Clock size={14} />}
                      {apt.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="appointment-details" style={{ marginTop: '1rem' }}>
                  <div className="appointment-detail">
                    <Calendar size={16} /> <span>{apt.date}</span>
                  </div>
                  <div className="appointment-detail">
                    <Clock size={16} /> <span>{apt.time}</span>
                  </div>
                </div>

                {/* Displaying the Vet's Response from Atlas */}
                {apt.response && (
                  <div className="vet-response" style={{ 
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    background: 'var(--background)', 
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--primary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      <MessageSquare size={16} /> Veterinarian Feedback
                    </div>
                    <p style={{ fontSize: '0.95rem', fontStyle: 'italic' }}>"{apt.response}"</p>
                  </div>
                )}

                <div className="appointment-footer" style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  ID: {apt._id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentPage;