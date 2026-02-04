import React from "react";
import {
  Sparkles,
  Calendar,
  Heart,
  ChevronRight,
  LogIn,
  PawPrint,
  AlertCircle,
  Plus,
} from "lucide-react";
import DogCard from "../components/DogCard";
import Footer from "../components/Footer";

const HomePage = ({ user, role, navigateTo, adoptionDogs }) => {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="paw-pattern"></div>
          <div className="paw-pattern paw-2"></div>
          <div className="paw-pattern paw-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Caring for Paws
              <br />
              <span className="gradient-text">with AI</span>
            </h1>
            <p className="hero-subtitle">
              Early detection, faster care, happier dogs
            </p>
            <div className="hero-buttons">
              {role !== "vet" && (
                <button
                  className="hero-btn"
                  onClick={() => navigateTo("booking")}
                >
                  <Calendar size={20} />
                  Book a Vet Appointment
                  <ChevronRight size={20} />
                </button>
              )}

              {!user && (
                <button
                  className="btn-outline btn-large"
                  onClick={() => navigateTo("login")}
                >
                  <LogIn size={20} />
                  Login / Register
                </button>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=500&fit=crop"
                alt="Happy dog"
              />
              <div className="hero-image-badge">
                <PawPrint size={20} />
                <div>
                  <div className="badge-title">Happy & Healthy</div>
                  <div className="badge-text">1000+ Dogs Helped</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose Pal for Paw?</h2>
          <p>Comprehensive care for your furry friends</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon ai-icon">
              <Sparkles size={28} />
            </div>
            <h3>AI Disease Detection</h3>
            <p>Advanced machine learning to identify skin conditions early</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon booking-icon">
              <Calendar size={28} />
            </div>
            <h3>Easy Booking</h3>
            <p>Schedule vet appointments in just a few clicks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon adopt-icon">
              <Heart size={28} />
            </div>
            <h3>Adoption Platform</h3>
            <p>Find your perfect furry companion</p>
          </div>
        </div>
      </section>

      {/* Adoption Section */}
      <section className="adoption-section">
        <div className="section-header">
          <h2>
            <Heart size={32} className="section-icon" />
            Dogs Available for Adoption
          </h2>
          <p>Give a loving home to these wonderful companions</p>
        </div>

        {!user && (
          <div className="info-banner">
            <AlertCircle size={20} />
            <span>Login to add dogs for adoption</span>
          </div>
        )}

        {user && role === "user" && (
          <div className="add-dog-section">
            <button
              className="btn-primary"
              onClick={() => navigateTo("add-dog")}
            >
              <Plus size={20} />
              Add Dog for Adoption
            </button>
          </div>
        )}

        <div className="dogs-grid">
          {adoptionDogs.map((dog, index) => (
            <DogCard key={dog.id} dog={dog} index={index} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
