import React from 'react';
import { Bell, Calendar, Clock, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const VetDashboardPage = ({ 
  user, 
  role, 
  navigateTo, 
  appointments, 
  setAppointments, 
  userAppointments, 
  setUserAppointments 
}) => {
  const handleAccept = (id) => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'accepted', response: 'Your appointment has been confirmed.' } : apt
    );
    setAppointments(updated);
    setUserAppointments(userAppointments.map(apt =>
      apt.id === id ? { ...apt, status: 'accepted', response: 'Your appointment has been confirmed.' } : apt
    ));
  };

  const handleReject = (id) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'rejected', response: reason || 'Appointment was rejected.' } : apt
    );
    setAppointments(updated);
    setUserAppointments(userAppointments.map(apt =>
      apt.id === id ? { ...apt, status: 'rejected', response: reason || 'Appointment was rejected.' } : apt
    ));
  };

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

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Bell size={36} />
          Appointment Requests
        </h1>
        <p>Manage incoming appointment requests</p>
      </div>

      <div className="vet-dashboard">
        {pendingAppointments.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} />
            <h3>No Pending Appointments</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="appointments-list">
            {pendingAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card vet-card">
                <div className="appointment-header">
                  <div>
                    <h3>{appointment.dogName}</h3>
                    <p className="appointment-owner">Owner: {appointment.ownerName}</p>
                  </div>
                  <div className="status-badge pending">
                    <Clock size={16} />
                    Pending
                  </div>
                </div>
                <div className="appointment-details">
                  <div className="appointment-detail">
                    <Calendar size={16} />
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                  <div className="appointment-detail">
                    <Clock size={16} />
                    {appointment.time}
                  </div>
                  <div className="appointment-detail">
                    <Phone size={16} />
                    {appointment.contact}
                  </div>
                  <div className="appointment-detail">
                    <Mail size={16} />
                    {appointment.email}
                  </div>
                </div>
                {appointment.notes && (
                  <div className="appointment-notes">
                    <strong>Patient Notes:</strong> {appointment.notes}
                  </div>
                )}
                <div className="appointment-actions">
                  <button className="btn-success" onClick={() => handleAccept(appointment.id)}>
                    <CheckCircle size={18} />
                    Accept
                  </button>
                  <button className="btn-danger" onClick={() => handleReject(appointment.id)}>
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VetDashboardPage;
