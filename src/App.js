import React, { useState, useEffect } from 'react';
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
  
  // State managed via MongoDB Atlas
  const [adoptionDogs, setAdoptionDogs] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // --- 1. DATA SYNC WITH MONGODB ATLAS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Adoption Dogs (Always available)
        const dogRes = await fetch('http://localhost:5000/api/dogs');
        const dogData = await dogRes.json();
        setAdoptionDogs(Array.isArray(dogData) ? dogData : []);

        // Fetch Appointments (Only if logged in)
        if (user) {
          const aptRes = await fetch(
            `http://localhost:5000/api/appointments?role=${role}&email=${user.email}`
          );
          const aptData = await aptRes.json();
          setAppointments(Array.isArray(aptData) ? aptData : []);
        }
      } catch (error) {
        console.error("Error syncing with MongoDB Atlas:", error);
      }
    };

    fetchData();
  }, [user, role, currentPage]); // Refetch on navigation to keep history updated

  // --- 2. NAVIGATION & LOGOUT LOGIC ---
  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home'); // FIX: Force redirect to home to prevent "Access Restricted" view
  };

  // --- 3. PAGE ROUTING LOGIC ---
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
        // Protection: Vets should not be able to book
        if (role === 'vet') return <HomePage user={user} role={role} navigateTo={navigateTo} adoptionDogs={adoptionDogs} />;
        return (
          <BookingPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            appointments={appointments}
            setAppointments={setAppointments}
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
            setAdoptionDogs={setAdoptionDogs}
          />
        );
      case 'my-appointments':
        return (
          <MyAppointmentPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            // Filters history for the specific logged-in user
            userAppointments={appointments.filter(apt => apt.email === user?.email)} 
          />
        );
      case 'vet-dashboard':
        // Protection: Only Vets can see this dashboard
        if (role !== 'vet') return <HomePage user={user} role={role} navigateTo={navigateTo} adoptionDogs={adoptionDogs} />;
        return (
          <VetDashboardPage 
            user={user} 
            role={role} 
            navigateTo={navigateTo} 
            appointments={appointments}
            setAppointments={setAppointments}
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
        return <HomePage user={user} role={role} navigateTo={navigateTo} adoptionDogs={adoptionDogs} />;
    }
  };

  return (
    <div className="app">
      <Header 
        user={user}
        role={role}
        currentPage={currentPage}
        navigateTo={navigateTo}
        logout={handleLogout} // Uses the corrected logout handler
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;