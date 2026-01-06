import './NotFound.css';
import React, { useEffect } from 'react';

const NotFound: React.FC = () => {
  useEffect(() => {
  // Scroll to top when unauthorized page is mounted
  window.scrollTo(0, 0);

  // Lock scrolling
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  return () => {
    // Restore scroll state
    document.body.style.overflow = originalOverflow;
  };
}, []);
  return (
    <div className="unauthorized-container">
      <div className="cow">
        <div className="head">
          <div className="face"></div>
        </div>
        <div className="leg b l"></div>
        <div className="leg b r"></div>
        <div className="leg f l"></div>
        <div className="leg f r"></div>
        <div className="tail"></div>
      </div>
      <div className="well">
        <a href="/" className="home-btn" >Go Home</a>
      </div>
      <div className="text-box">
        <h1>404</h1>
        <p>Sorry, No Page Found.</p>
      </div>
    </div>
  );
};

export default NotFound;
