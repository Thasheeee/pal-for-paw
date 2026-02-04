import React, { useState } from 'react';
import { PawPrint, UserPlus, User, Stethoscope } from 'lucide-react';

const RegisterPage = ({ login, navigateTo }) => {
  const [selectedRole, setSelectedRole] = useState('user');
  const [email, setEmail] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (email) {
      login(email, selectedRole);
      navigateTo('home');
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
              <input type="text" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
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