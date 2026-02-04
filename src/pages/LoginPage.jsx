import React, { useState } from 'react';
import { PawPrint, LogIn, User, Stethoscope, AlertCircle } from 'lucide-react';

const LoginPage = ({ login, navigateTo }) => {
  const [selectedRole, setSelectedRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Send login request to Flask backend
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          role: selectedRole // This ensures the role is checked in Atlas
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. If backend confirms credentials + role, log them in
        login(data.email, data.role);
        navigateTo('home');
      } else {
        // 3. Display the "Invalid email, password, or role choice" error
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
            <h2>Welcome Back!</h2>
            <p>Login to access your account</p>
          </div>

          {/* Show error message if login fails */}
          {error && (
            <div className="result-disclaimer" style={{backgroundColor: '#e74c3c', color: 'white', marginBottom: '1rem', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
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
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
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