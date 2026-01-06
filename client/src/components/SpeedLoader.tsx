import React from "react";
import "./SpeederLoader.css";

const SpeederLoader: React.FC = () => {
  return (
    <div className="loader-wrapper">
      {/* Flipping Images */}
      <div className="flip-container">
        <div className="flip-inner">
          {/* Front side */}
          <div className="flip-front">
            <img
              src="https://res.cloudinary.com/djyredhur/image/upload/v1751127717/logo_ktewtc.png"
              alt="Hansitha Logo"
            />
          </div>
          {/* Back side */}
          <div className="flip-back">
            <img
              src="https://res.cloudinary.com/duajnpevb/image/upload/v1754998121/15-years_cq5nkg.jpg"
              alt="15 Years"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeederLoader;
