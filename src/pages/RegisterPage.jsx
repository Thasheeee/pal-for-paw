import React, { useState } from 'react';
import { PawPrint, UserPlus, User, Stethoscope, AlertCircle } from 'lucide-react';

const RegisterPage = ({ login, navigateTo }) => {
  const [selectedRole, setSelectedRole] = useState('user');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      //  Send data to  Flask Backend
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: selectedRole
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If successful, log in and navigate
        login(formData.email, selectedRole);
        navigateTo('home');
      } else {
        // Display backend errors 
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to connect to the server. Is your Flask app running?");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <PawPrint size={48} className="auth-icon" />
            <h2>Join Pal for Paw</h2>
            <p>Create your account to get started</p>
          </div>

          {/* Show error message if registration fails */}
          {error && (
            <div className="result-disclaimer" style={{backgroundColor: 'var(--error)', color: 'white', marginBottom: '1rem'}}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="role-selector">
            <button
              className={`role-option ${selectedRole === 'user' ? 'active' : ''}`}
              onClick={() => setSelectedRole('user')}
            >
              <User size={32} />
              <span>Dog Owner</span>
            </button>
            <button
              className={`role-option ${selectedRole === 'vet' ? 'active' : ''}`}
              onClick={() => setSelectedRole('vet')}
            >
              <Stethoscope size={32} />
              <span>Veterinarian</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary btn-full">
              <UserPlus size={20} />
              Register as {selectedRole === 'user' ? 'Dog Owner' : 'Veterinarian'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <button className="link-btn" onClick={() => navigateTo('login')}>
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;