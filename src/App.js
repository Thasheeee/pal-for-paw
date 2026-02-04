// File: App.jsx
// Main application component

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import PredictPage from './pages/PredictPage';
import AddDogPage from './pages/AddDogPage';
import MyAppointmentPage from './pages/MyAppointmentPage';
import VetDashboardPage from './pages/VetDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './styles/styles.css';

const App = () => {
  const { user, role, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initial adoption dogs data
  const [adoptionDogs, setAdoptionDogs] = useState([
    {
      id: 1,
      name: 'Buddy',
      age: 3,
      breed: 'Golden Retriever',
      description: 'Friendly and energetic, loves to play fetch!',
      location: 'Los Angeles, CA',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Luna',
      age: 2,
      breed: 'Husky',
      description: 'Beautiful blue eyes, very gentle and loving.',
      location: 'Seattle, WA',
      image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Max',
      age: 1,
      breed: 'Beagle',
      description: 'Playful puppy looking for an active family!',
      location: 'Austin, TX',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=300&fit=crop'
    }
  ]);
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);

  // Navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
      case 'adoption':
        return (
          <HomePage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            adoptionDogs={adoptionDogs} 
          />
        );
      case 'login':
        return <LoginPage login={login} navigateTo={navigateTo} />;
      case 'register':
        return <RegisterPage login={login} navigateTo={navigateTo} />;
      case 'booking':
        return (
          <BookingPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            appointments={appointments}
            setAppointments={setAppointments}
            userAppointments={userAppointments}
            setUserAppointments={setUserAppointments}
          />
        );
      case 'predict':
        return <PredictPage user={user} role={role} navigateTo={navigateTo} />;
      case 'add-dog':
        return (
          <AddDogPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            adoptionDogs={adoptionDogs}
            setAdoptionDogs={setAdoptionDogs}
          />
        );
      case 'my-appointments':
        return (
          <MyAppointmentPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            userAppointments={userAppointments}
          />
        );
      case 'vet-dashboard':
        return (
          <VetDashboardPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            appointments={appointments}
            setAppointments={setAppointments}
            userAppointments={userAppointments}
            setUserAppointments={setUserAppointments}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            appointments={appointments}
          />
        );
      default:
        return (
          <HomePage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            adoptionDogs={adoptionDogs} 
          />
        );
    }
  };

  return (
    <div className="app">
      <Header 
        user={user}
        role={role}
        currentPage={currentPage}
        navigateTo={navigateTo}
        logout={logout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      {renderPage()}
    </div>
  );
};

export default App;
