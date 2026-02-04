import React, { useState } from 'react';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';

const AddDogPage = ({ user, role, navigateTo, adoptionDogs, setAdoptionDogs }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    description: '',
    location: '',
    image: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDog = {
      id: Date.now(),
      ...formData,
      age: parseInt(formData.age),
      image: formData.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop'
    };
    setAdoptionDogs([...adoptionDogs, newDog]);
    setSubmitted(true);
    setTimeout(() => {
      navigateTo('home');
    }, 2000);
  };

  if (!user || role !== 'user') {
    return (
      <div className="page">
        <div className="restriction-message">
          <AlertCircle size={64} />
          <h2>Login Required</h2>
          <p>Please login as a dog owner to add dogs for adoption</p>
          <button className="btn-primary" onClick={() => navigateTo('login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Plus size={36} />
          Add Dog for Adoption
        </h1>
        <p>Help a furry friend find their forever home</p>
      </div>

      <div className="add-dog-container">
        {submitted ? (
          <div className="success-message">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Dog Added Successfully!</h2>
            <p>Your dog is now visible on the adoption page</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="add-dog-form">
            <div className="form-group">
              <label>Dog's Name</label>
              <input
                type="text"
                placeholder="Buddy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age (years)</label>
                <input
                  type="number"
                  placeholder="3"
                  min="0"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input
                  type="text"
                  placeholder="Golden Retriever"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="Los Angeles, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe the dog's personality, habits, and any special needs..."
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Photo URL (optional)</label>
              <input
                type="url"
                placeholder="https://example.com/dog-photo.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary btn-full">
              <Plus size={20} />
              Add Dog for Adoption
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddDogPage;
