import React from "react";
import {
  PawPrint,
  LogIn,
  UserPlus,
  Menu,
  X,
  Home,
  Heart,
  Calendar,
  Sparkles,
  Bell,
  BarChart3,
  User,
  Stethoscope,
} from "lucide-react";

const Header = ({
  user,
  role,
  currentPage,
  navigateTo,
  logout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigateTo("home")}>
          <div className="logo-icon">
            <PawPrint size={32} strokeWidth={2.5} />
          </div>
          <div className="logo-text">
            <span className="logo-main">Pal for Paw</span>
            <span className="logo-sub">Smart Pet Care</span>
          </div>
        </div>

        <nav className="desktop-nav">
          <button
            onClick={() => navigateTo("home")}
            className={currentPage === "home" ? "active" : ""}
          >
            <Home size={18} />
            Home
          </button>
          <button
            onClick={() => navigateTo("adoption")}
            className={currentPage === "adoption" ? "active" : ""}
          >
            <Heart size={18} />
            Adopt
          </button>
          {user && role !== "vet" && (
            <button
              className={`nav-link ${currentPage === "booking" ? "active" : ""}`}
              onClick={() => navigateTo("booking")}
            >
              <Calendar size={18} />
              <span>Book Vet</span>
            </button>
          )}
          {user && role === "user" && (
            <>
              <button
                onClick={() => navigateTo("predict")}
                className={currentPage === "predict" ? "active" : ""}
              >
                <Sparkles size={18} />
                Predict
              </button>
              <button
                onClick={() => navigateTo("my-appointments")}
                className={currentPage === "my-appointments" ? "active" : ""}
              >
                <Calendar size={18} />
                My Appointments
              </button>
            </>
          )}
          {user && role === "vet" && (
            <>
              <button
                onClick={() => navigateTo("vet-dashboard")}
                className={currentPage === "vet-dashboard" ? "active" : ""}
              >
                <Bell size={18} />
                Appointments
              </button>
              <button
                onClick={() => navigateTo("analytics")}
                className={currentPage === "analytics" ? "active" : ""}
              >
                <BarChart3 size={18} />
                Analytics
              </button>
            </>
          )}
        </nav>

        <div className="header-actions">
          {!user ? (
            <>
              <button
                className="btn-secondary"
                onClick={() => navigateTo("login")}
              >
                <LogIn size={18} />
                Login
              </button>
              <button
                className="btn-primary"
                onClick={() => navigateTo("register")}
              >
                <UserPlus size={18} />
                Register
              </button>
            </>
          ) : (
            <div className="user-menu">
              <div className="user-badge">
                {role === "vet" ? (
                  <Stethoscope size={18} />
                ) : (
                  <User size={18} />
                )}
                <span>{user.email}</span>
              </div>
              <button className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </div>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button onClick={() => navigateTo("home")}>
            <Home size={20} />
            Home
          </button>
          <button onClick={() => navigateTo("adoption")}>
            <Heart size={20} />
            Adopt a Dog
          </button>
          {role !== "vet" && (
            <button
              onClick={() => navigateTo("booking")}
              className={currentPage === "booking" ? "active" : ""}
            >
              <Calendar size={18} /> Book Vet
            </button>
          )}

          {user && role === "user" && (
            <>
              <button onClick={() => navigateTo("predict")}>
                <Sparkles size={20} />
                Predict Disease
              </button>
              <button onClick={() => navigateTo("my-appointments")}>
                <Calendar size={20} />
                My Appointments
              </button>
            </>
          )}

          {user && role === "vet" && (
            <>
              <button onClick={() => navigateTo("vet-dashboard")}>
                <Bell size={20} />
                Appointments
              </button>
              <button onClick={() => navigateTo("analytics")}>
                <BarChart3 size={20} />
                Analytics
              </button>
            </>
          )}

          {!user && (
            <>
              <button onClick={() => navigateTo("login")}>
                <LogIn size={20} />
                Login
              </button>
              <button onClick={() => navigateTo("register")}>
                <UserPlus size={20} />
                Register
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
