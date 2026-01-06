import React from "react";

interface TruckButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  animate?: boolean;
  className?: string;
}

export const TruckButton: React.FC<TruckButtonProps> = ({
  animate = false,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`relative h-[63px] w-full max-w-sm rounded-full overflow-hidden bg-dark text-white transition-transform active:scale-95
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${animate ? "pointer-events-none" : ""}
        ${className}
      `}
    >
      {/* Default Text */}
      {!animate && (
        <span
          className="absolute left-0 right-0 top-[19px] text-center font-medium text-[16px]"
        >
          Complete Order
        </span>
      )}

      {/* Success Text */}
      {animate && (
        <span
          className="absolute left-0 right-0 top-[19px] text-center font-medium text-[16px] flex justify-center items-center"
        >
          Order Placed
          <svg
            viewBox="0 0 12 10"
            className="w-3 h-2 ml-1 stroke-green stroke-[2] fill-none"
            style={{
              strokeDasharray: "16px",
              strokeDashoffset: "0",
              transition: "stroke-dashoffset 0.3s ease",
              transitionDelay: "7.3s",
            }}
          >
            <polyline points="1.5 6 4.5 9 10.5 1" />
          </svg>
        </span>
      )}

      {/* Moving Lines */}
      <div
        className={`absolute h-[3px] w-[6px] top-[30px] left-full rounded bg-white shadow-[15px_0_0_white,30px_0_0_white,45px_0_0_white,60px_0_0_white,75px_0_0_white,90px_0_0_white,105px_0_0_white,120px_0_0_white,135px_0_0_white,150px_0_0_white,165px_0_0_white,180px_0_0_white,195px_0_0_white,210px_0_0_white,225px_0_0_white,240px_0_0_white,255px_0_0_white,270px_0_0_white,285px_0_0_white,300px_0_0_white,315px_0_0_white,330px_0_0_white] ${
          animate ? "animate-lines" : "hidden"
        }`}
      ></div>

      {/* Box */}
      <div
        className={`absolute right-full top-[21px] w-[21px] h-[21px] rounded-sm bg-sand ${
          animate ? "animate-box" : "hidden"
        }`}
      >
        <div className="absolute top-[10px] left-0 right-0 h-[3px] bg-black/10"></div>
        <div className="absolute top-[10px] left-0 right-0 h-[1px] bg-black/15"></div>
      </div>

      {/* Truck */}
      <div
        className={`absolute top-[11px] left-full w-[60px] h-[41px] translate-x-[24px] z-[1] ${
          animate ? "animate-truck" : "hidden"
        }`}
      >
        {/* Truck Back */}
        <div className="absolute left-0 top-0 w-[60px] h-[41px] bg-gray-200 rounded-sm"></div>

        {/* Truck Front */}
        <div className="left-[60px] w-[26px] h-[41px] rounded-[2px_9px_9px_2px] overflow-hidden relative">
          <div className="absolute left-0 top-[14px] w-[2px] h-[13px] bg-gradient-to-b from-gray-500 to-gray-700"></div>
          <div className="absolute right-0 w-[24px] h-[41px] rounded-[2px_9px_9px_2px] bg-primary"></div>

          {/* Window */}
          <div className="absolute left-[2px] top-0 w-[22px] h-[41px] bg-primary-light rounded-[2px_8px_8px_2px] overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-[14px] bg-dark"></div>
            <div className="absolute right-0 top-[7px] h-[4px] w-[14px] bg-white/15 skew-y-[14deg] shadow-[0_7px_0_rgba(255,255,255,0.14)]"></div>
          </div>
        </div>
      </div>
    </button>
  );
};