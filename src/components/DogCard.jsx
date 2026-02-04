import React from 'react';
import { Heart, PawPrint, Clock, MapPin } from 'lucide-react';

const DogCard = ({ dog, index }) => {
  return (
    <div className="dog-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="dog-image">
        <img src={dog.image} alt={dog.name} />
        <div className="adoption-badge">
          <Heart size={16} />
          Available
        </div>
      </div>
      <div className="dog-info">
        <h3>{dog.name}</h3>
        <div className="dog-details">
          <span className="dog-detail">
            <PawPrint size={14} />
            {dog.breed}
          </span>
          <span className="dog-detail">
            <Clock size={14} />
            {dog.age} {dog.age === 1 ? 'year' : 'years'}
          </span>
        </div>
        <p className="dog-description">{dog.description}</p>
        <div className="dog-location">
          <MapPin size={14} />
          {dog.location}
        </div>
      </div>
    </div>
  );
};

export default DogCard;
