// src/components/Loader.tsx
import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* Custom CSS for two VERY SLOW horizontal rotations */}
      <style>
        {`
          @keyframes spin-horizontal-twice {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(720deg); } /* 720 degrees = 2 full rotations */
          }
          .animate-spin-twice-slow {
            /* 
              - Increased duration to '8s' to make it animate for a longer time
              - 'ease-in-out' makes it start slowly, spin, and gently come to a stop
              - '1' plays this sequence exactly once
              - 'forwards' keeps it locked at the end state
            */
            animation: spin-horizontal-twice 8s ease-in-out 1 forwards;
            transform-style: preserve-3d;
          }
        `}
      </style>

      {/* Horizontally Rotating Logo Image (Spins Twice Very Slowly) */}
      <img
        src="https://image2url.com/r2/default/images/1772210752906-48de2b16-a37a-4aca-8bcd-c8439232bd7a.png"
        alt="Loading..."
        className="w-48 h-48 md:w-64 md:h-64 object-contain animate-spin-twice-slow"
      />
    </div>
  );
};

export default Loader;