import React from 'react';
import { Calendar, Clock, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MyAppointmentsPage = ({ user, role, navigateTo, userAppointments }) => {
  if (!user || role !== 'user') {
    return (
      <div className="page">
        <div className="restriction-message">
          <AlertCircle size={64} />
          <h2>Login Required</h2>
          <p>Please login to view your appointments</p>
          <button className="btn-primary" onClick={() => navigateTo('login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Calendar size={36} />
          My Appointments
        </h1>
        <p>View and manage your vet appointments</p>
      </div>

      <div className="appointments-container">
        {userAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No Appointments Yet</h3>
            <p>Book your first appointment to get started</p>
            <button className="btn-primary" onClick={() => navigateTo('booking')}>
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="appointments-list">
            {userAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h3>{appointment.dogName}</h3>
                    <p className="appointment-owner">{appointment.ownerName}</p>
                  </div>
                  <div className={`status-badge ${appointment.status}`}>
                    {appointment.status === 'pending' && <Clock size={16} />}
                    {appointment.status === 'accepted' && <CheckCircle size={16} />}
                    {appointment.status === 'rejected' && <XCircle size={16} />}
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
                </div>
                {appointment.notes && (
                  <div className="appointment-notes">
                    <strong>Notes:</strong> {appointment.notes}
                  </div>
                )}
                {appointment.response && (
                  <div className="vet-response">
                    <strong>Veterinarian Response:</strong> {appointment.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
