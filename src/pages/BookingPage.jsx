import React, { useState } from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

const BookingPage = ({ 
  user, 
  role, 
  navigateTo, 
  appointments, 
  setAppointments, 
  userAppointments, 
  setUserAppointments 
}) => {
  const [formData, setFormData] = useState({
    dogName: '',
    ownerName: '',
    contact: '',
    email: '',
    date: '',
    time: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAppointment = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setAppointments([...appointments, newAppointment]);
    if (user && role === 'user') {
      setUserAppointments([...userAppointments, newAppointment]);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        dogName: '',
        ownerName: '',
        contact: '',
        email: '',
        date: '',
        time: '',
        notes: ''
      });
    }, 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Calendar size={36} />
          Book a Vet Appointment
        </h1>
        <p>Schedule a visit for your furry friend</p>
      </div>

      <div className="booking-container">
        {submitted ? (
          <div className="success-message">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Appointment Request Sent!</h2>
            <p>Your appointment request has been sent to a veterinarian. You will receive a confirmation soon.</p>
            <button className="btn-primary" onClick={() => navigateTo('home')}>
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label>Dog's Name</label>
                <input
                  type="text"
                  placeholder="Buddy"
                  value={formData.dogName}
                  onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner's Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                placeholder="Please describe any specific concerns or symptoms..."
                rows="4"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary btn-full">
              <Calendar size={20} />
              Book Appointment
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
