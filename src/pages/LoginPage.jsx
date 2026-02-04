import React, { useState } from 'react';
import { PawPrint, LogIn, User, Stethoscope } from 'lucide-react';

const LoginPage = ({ login, navigateTo }) => {
  const [selectedRole, setSelectedRole] = useState('user');
  const [email, setEmail] = useState('');

  const handleLogin = (e) => {
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
            <h2>Welcome Back!</h2>
            <p>Login to access your account</p>
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

          <form onSubmit={handleLogin} className="auth-form">
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
              <LogIn size={20} />
              Login as {selectedRole === 'user' ? 'Dog Owner' : 'Veterinarian'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <button className="link-btn" onClick={() => navigateTo('register')}>
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
