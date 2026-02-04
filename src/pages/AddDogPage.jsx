import React, { useState } from 'react';
import { Plus, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';

const AddDogPage = ({ user, role, navigateTo, setAdoptionDogs }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    description: '',
    location: '',
    image: '' // This will store the Base64 string
  });
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Convert File to Base64 String
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { // 1MB limit check for prototype performance
        alert("File is too large. Please select an image under 1MB.");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/dogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          ownerEmail: user.email // Linking dog to the current user
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          navigateTo('home');
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving dog to Atlas:", error);
    }
  };

  if (!user || role !== 'user') {
    return (
      <div className="page">
        <div className="restriction-message">
          <AlertCircle size={64} />
          <h2>Login Required</h2>
          <p>Please login as a dog owner to add dogs for adoption</p>
          <button className="btn-primary" onClick={() => navigateTo('login')}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Plus size={36} /> Add Dog for Adoption</h1>
        <p>Help a furry friend find their forever home</p>
      </div>

      <div className="add-dog-container">
        {submitted ? (
          <div className="success-message">
            <div className="success-icon"><CheckCircle size={64} /></div>
            <h2>Dog Added to Atlas!</h2>
            <p>Your dog is now visible in our cloud database.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="add-dog-form">
            <div className="form-group">
              <label>Dog's Name</label>
              <input type="text" placeholder="Buddy" required
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age (years)</label>
                <input type="number" placeholder="3" min="0" required
                  value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input type="text" placeholder="Golden Retriever" required
                  value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input type="text" placeholder="Colombo, Sri Lanka" required
                value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Describe the dog's personality..." rows="4" required
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>

            <div className="form-group">
              <label>Dog Photo</label>
              <div className="upload-box" style={{ minHeight: '150px', cursor: 'pointer' }}>
                {!formData.image ? (
                  <label className="upload-label">
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <Upload size={32} />
                    <p>{isUploading ? "Processing..." : "Click to upload dog image"}</p>
                  </label>
                ) : (
                  <div className="image-preview" style={{ position: 'relative' }}>
                    <img src={formData.image} alt="Preview" style={{ maxHeight: '200px', borderRadius: '12px' }} />
                    <button type="button" className="remove-image" onClick={() => setFormData({ ...formData, image: '' })}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={!formData.image || isUploading}>
              <Plus size={20} /> Add Dog for Adoption
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddDogPage;