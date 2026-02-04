import React from 'react';
import { BarChart3, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AnalyticsPage = ({ user, role, navigateTo, appointments }) => {
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

  const totalAppointments = appointments.length;
  const acceptedAppointments = appointments.filter(apt => apt.status === 'accepted').length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <BarChart3 size={36} />
          Analytics Dashboard
        </h1>
        <p>Overview of appointments and disease trends</p>
      </div>

      <div className="analytics-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <Calendar size={32} />
            </div>
            <div className="stat-content">
              <h3>{totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accepted">
              <CheckCircle size={32} />
            </div>
            <div className="stat-content">
              <h3>{acceptedAppointments}</h3>
              <p>Accepted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={32} />
            </div>
            <div className="stat-content">
              <h3>{pendingAppointments}</h3>
              <p>Pending</p>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h3>Common Skin Diseases</h3>
          <div className="chart-bars">
            <div className="chart-bar">
              <label>Atopic Dermatitis</label>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '85%' }}>85%</div>
              </div>
            </div>
            <div className="chart-bar">
              <label>Hot Spots</label>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '65%' }}>65%</div>
              </div>
            </div>
            <div className="chart-bar">
              <label>Ringworm</label>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '45%' }}>45%</div>
              </div>
            </div>
            <div className="chart-bar">
              <label>Mange</label>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '30%' }}>30%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
