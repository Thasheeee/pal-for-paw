import React from 'react';
import { PawPrint, Mail, Phone, AlertCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-divider">
        <PawPrint size={24} />
      </div>
      <div className="footer-content">
        <div className="footer-section">
          <h4>Pal for Paw</h4>
          <p>AI-powered platform for dog health and adoption</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <div className="footer-links">
            <a href="mailto:info@palforpaw.com">
              <Mail size={16} />
              info@palforpaw.com
            </a>
            <a href="tel:+1234567890">
              <Phone size={16} />
              (123) 456-7890
            </a>
          </div>
        </div>
      </div>
      <div className="footer-disclaimer">
        <AlertCircle size={16} />
        <p>Pal for Paw is not a replacement for professional veterinary diagnosis. Always consult with a licensed veterinarian for medical advice.</p>
      </div>
    </footer>
  );
};

export default Footer;
